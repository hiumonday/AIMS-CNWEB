//package com.ecommerce.aims.user.services;
//
//import com.ecommerce.aims.common.exception.BusinessException;
//import com.ecommerce.aims.common.exception.NotFoundException;
//import com.ecommerce.aims.security.jwt.JwtService;
//import com.ecommerce.aims.user.dto.AuthResponse;
//import com.ecommerce.aims.user.dto.ChangePasswordRequest;
//import com.ecommerce.aims.user.dto.LoginRequest;
//import com.ecommerce.aims.user.dto.UserResponse;
//import com.ecommerce.aims.user.models.User;
//import com.ecommerce.aims.user.models.UserPrincipal;
//import com.ecommerce.aims.user.repository.UserRepository;
//import java.time.LocalDateTime;
//import java.util.Objects;
//import java.util.stream.Collectors;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//@RequiredArgsConstructor
//public class AuthService {
//
//    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
//
//    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final AuthenticationManager authenticationManager;
//    private final JwtService jwtService;
//
//    @Transactional
//    public AuthResponse login(LoginRequest request) {
//        Objects.requireNonNull(request, "request must not be null");
//        log.info("Login attempt email={}", request.getEmail());
//
//        try {
//            // TODO: OCP violation - login flow is hardcoded to username/password authentication.
//            // Why this is risky:
//            // - Adding new auth methods (OAuth2/OIDC, OTP, LDAP, SSO, card-based auth, etc.) requires modifying this method
//            //   instead of extending behavior via composition.
//            // - The service becomes a “god method” that grows branches (if/else) for each auth type.
//            // Recommended refactor:
//            // - Introduce an AuthStrategy interface (or use Spring Security AuthenticationProvider chain).
//            // - Let login() select an appropriate strategy based on request type, then return a common AuthResult.
//            Authentication auth = authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
//
//            // TODO: DIP violation - service depends on concrete principal type (UserPrincipal) via casting.
//            // Why this is risky:
//            // - Different AuthenticationProviders may return a different principal type (e.g., OidcUser for Google login).
//            // - This increases coupling between AuthService and the current security implementation.
//            // Recommended refactor:
//            // - Depend on the abstraction (UserDetails) or introduce a small adapter utility (e.g., SecurityUtils)
//            //   that extracts userId/username from Authentication in a provider-agnostic way.
//            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
//            User user = userRepository.findById(principal.getId())
//                .orElseThrow(() -> new NotFoundException("User not found"));
//
//            log.info("User authenticated id={}, status={}, roles={}", user.getId(), user.getStatus(),
//                user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.joining(",")));
//
//            // Generate JWT tokens
//            String accessToken = jwtService.generateAccessToken(principal);
//            String refreshToken = jwtService.generateRefreshToken(principal);
//
//            return AuthResponse.of(
//                accessToken,
//                refreshToken,
//                jwtService.getAccessTokenExpiration(),
//                toResponse(user)
//            );
//        } catch (AuthenticationException ex) {
//            log.error("Authentication failed for email={} : {}", request.getEmail(), ex.getMessage());
//            throw new BusinessException("Invalid credentials");
//        }
//    }
//
//    @Transactional
//    public AuthResponse refreshAccessToken(String refreshTokenStr) {
//        Objects.requireNonNull(refreshTokenStr, "refreshToken must not be null");
//        // Validate refresh token
//        if (!jwtService.isRefreshToken(refreshTokenStr)) {
//            throw new BusinessException("Invalid refresh token");
//        }
//
//        String username = jwtService.extractUsername(refreshTokenStr);
//        User user = userRepository.findByEmail(username)
//            .orElseThrow(() -> new NotFoundException("User not found"));
//
//        UserPrincipal principal = new UserPrincipal(user);
//
//        // Validate token is still valid for this user
//        if (!jwtService.isTokenValid(refreshTokenStr, principal)) {
//            throw new BusinessException("Refresh token expired or invalid");
//        }
//
//        // Generate new tokens
//        String accessToken = jwtService.generateAccessToken(principal);
//        String newRefreshToken = jwtService.generateRefreshToken(principal);
//
//        return AuthResponse.of(
//            accessToken,
//            newRefreshToken,
//            jwtService.getAccessTokenExpiration(),
//            toResponse(user)
//        );
//    }
//
//    @Transactional
//    public void logout(String refreshTokenStr) {
//        // With stateless JWT, logout is handled client-side by clearing cookies
//        // No server-side action needed
//        log.info("Logout requested - client should clear cookies");
//    }
//
//    @Transactional
//    public UserResponse changePassword(Long userId, ChangePasswordRequest request) {
//        Long id = Objects.requireNonNull(userId, "userId must not be null");
//        Objects.requireNonNull(request, "request must not be null");
//        User user = userRepository.findById(id)
//            .orElseThrow(() -> new NotFoundException("User not found"));
//        if (user.getStatus() == com.ecommerce.aims.user.models.UserStatus.LOCKED) {
//            throw new BusinessException("User is locked");
//        }
//        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
//            throw new BusinessException("Old password incorrect");
//        }
//        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
//        user.setLastPasswordChangeAt(LocalDateTime.now());
//
//        // Note: With stateless JWT refresh tokens, old tokens remain valid until expiry
//        // Consider shorter refresh token TTL or implement token blacklist if needed
//
//        return toResponse(userRepository.save(user));
//    }
//
//    private UserResponse toResponse(User user) {
//        return UserResponse.builder()
//            .id(user.getId())
//            .email(user.getEmail())
//            .status(user.getStatus())
//            .roles(user.getRoles().stream()
//                .map(r -> r.getName().name())
//                .collect(Collectors.toSet()))
//            .build();
//    }
//}
