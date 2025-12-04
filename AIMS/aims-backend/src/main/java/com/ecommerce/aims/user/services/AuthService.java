package com.ecommerce.aims.user.services;

import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.user.dto.ChangePasswordRequest;
import com.ecommerce.aims.user.dto.LoginRequest;
import com.ecommerce.aims.user.dto.UserResponse;
import com.ecommerce.aims.user.models.User;
import com.ecommerce.aims.user.models.UserPrincipal;
import com.ecommerce.aims.user.repository.UserRepository;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UserResponse login(LoginRequest request) {
        log.info("Login attempt email={}", request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new NotFoundException("User not found"));
        log.info("User found id={}, status={}, roles={}", user.getId(), user.getStatus(),
            user.getRoles().stream().map(r -> r.getName()).collect(Collectors.joining(",")));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        log.info("Password match={}", matches);
        if (!matches) {
            throw new com.ecommerce.aims.common.exception.BusinessException("Invalid credentials");
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            return toResponse(userRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("User not found")));
        } catch (AuthenticationException ex) {
            log.error("Authentication failed for email={} : {}", request.getEmail(), ex.getMessage());
            throw new com.ecommerce.aims.common.exception.BusinessException("Invalid credentials");
        }
    }

    @Transactional
    public UserResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getStatus() == com.ecommerce.aims.user.models.UserStatus.LOCKED) {
            throw new BusinessException("User is locked");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("Old password incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .status(user.getStatus())
            .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()))
            .build();
    }
}
