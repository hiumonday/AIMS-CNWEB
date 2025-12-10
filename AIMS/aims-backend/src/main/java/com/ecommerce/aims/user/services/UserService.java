package com.ecommerce.aims.user.services;

import com.ecommerce.aims.common.dto.PageResponse;
import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.user.dto.UserRequest;
import com.ecommerce.aims.user.dto.UserResponse;
import com.ecommerce.aims.user.models.Role;
import com.ecommerce.aims.user.models.RoleName;
import com.ecommerce.aims.user.models.User;
import com.ecommerce.aims.user.models.UserStatus;
import com.ecommerce.aims.user.repository.RoleRepository;
import com.ecommerce.aims.user.repository.UserRepository;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BusinessException("Email and password are required");
        }
        userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            throw new BusinessException("Email already exists");
        });
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE);
        user.setRoles(resolveRoles(request.getRoles()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(request, "request must not be null");
        User user = userRepository.findById(requiredId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        if (request.getEmail() != null) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                if (!existing.getId().equals(requiredId)) {
                    throw new BusinessException("Email already exists");
                }
            });
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(resolveRoles(request.getRoles()));
        }
        return toResponse(userRepository.save(user));
    }

    public UserResponse getUser(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        return userRepository.findById(requiredId)
            .map(this::toResponse)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public PageResponse<UserResponse> listUsers(int page, int size) {
        Page<User> result = userRepository.findAll(PageRequest.of(page, size));
        return PageResponse.<UserResponse>builder()
            .items(result.map(this::toResponse).getContent())
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .build();
    }

    @Transactional
    public UserResponse lockUser(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        User user = userRepository.findById(requiredId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        user.setStatus(UserStatus.LOCKED);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse unlockUser(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        User user = userRepository.findById(requiredId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        return toResponse(userRepository.save(user));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return new HashSet<>();
        }
        return roleNames.stream()
            .map(name -> {
                try {
                    RoleName roleName = RoleName.valueOf(name);
                    return roleRepository.findByName(roleName)
                        .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
                } catch (IllegalArgumentException e) {
                    throw new BusinessException("Invalid role name: " + name);
                }
            })
            .collect(Collectors.toSet());
    }

    private UserResponse toResponse(User user) {
        User requiredUser = Objects.requireNonNull(user, "user must not be null");
        Set<Role> roles = requiredUser.getRoles() == null ? Set.of() : requiredUser.getRoles();
        return UserResponse.builder()
            .id(requiredUser.getId())
            .email(requiredUser.getEmail())
            .status(requiredUser.getStatus())
            .roles(roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()))
            .build();
    }
}
