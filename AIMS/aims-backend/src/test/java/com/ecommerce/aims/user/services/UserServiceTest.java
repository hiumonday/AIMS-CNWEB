package com.ecommerce.aims.user.services;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Role customerRole;
    private Role adminRole;
    private UserRequest userRequest;

    @BeforeEach
    void setUp() {
        // Setup roles
        customerRole = Role.builder()
            .id(1L)
            .name(RoleName.ROLE_CUSTOMER)
            .build();

        adminRole = Role.builder()
            .id(2L)
            .name(RoleName.ROLE_ADMIN)
            .build();

        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@aims.com");
        testUser.setPassword("$2a$10$encodedPassword");
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setRoles(Set.of(customerRole));

        // Setup user request
        userRequest = new UserRequest();
        userRequest.setEmail("newuser@aims.com");
        userRequest.setPassword("password123");
        userRequest.setStatus(UserStatus.ACTIVE);
        userRequest.setRoles(Set.of("ROLE_CUSTOMER"));
    }

    // ==================== CREATE USER TESTS ====================

    @Test
    @DisplayName("Create User - Success with valid data")
    void createUser_WithValidData_ShouldReturnUserResponse() {
        // Arrange
        when(userRepository.findByEmail("newuser@aims.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encodedPassword");
        when(roleRepository.findByName(RoleName.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });

        // Act
        UserResponse response = userService.createUser(userRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getEmail()).isEqualTo("newuser@aims.com");
        assertThat(response.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(response.getRoles()).contains("ROLE_CUSTOMER");

        verify(userRepository).findByEmail("newuser@aims.com");
        verify(passwordEncoder).encode("password123");
        verify(roleRepository).findByName(RoleName.ROLE_CUSTOMER);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Create User - Fail when email is null")
    void createUser_WithNullEmail_ShouldThrowBusinessException() {
        // Arrange
        userRequest.setEmail(null);

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(userRequest))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Email and password are required");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create User - Fail when password is null")
    void createUser_WithNullPassword_ShouldThrowBusinessException() {
        // Arrange
        userRequest.setPassword(null);

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(userRequest))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Email and password are required");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create User - Fail when email already exists")
    void createUser_WithDuplicateEmail_ShouldThrowBusinessException() {
        // Arrange
        when(userRepository.findByEmail("newuser@aims.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(userRequest))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Email already exists");

        verify(userRepository).findByEmail("newuser@aims.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create User - Should default to ACTIVE status when not provided")
    void createUser_WithoutStatus_ShouldDefaultToActive() {
        // Arrange
        userRequest.setStatus(null);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedPassword");
        when(roleRepository.findByName(any())).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });

        // Act
        UserResponse response = userService.createUser(userRequest);

        // Assert
        assertThat(response.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    @DisplayName("Create User - Fail with invalid role name")
    void createUser_WithInvalidRole_ShouldThrowBusinessException() {
        // Arrange
        userRequest.setRoles(Set.of("ROLE_INVALID"));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedPassword");

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(userRequest))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("Invalid role name");

        verify(userRepository, never()).save(any());
    }

    // ==================== UPDATE USER TESTS ====================

    @Test
    @DisplayName("Update User - Success with valid data")
    void updateUser_WithValidData_ShouldReturnUpdatedUser() {
        // Arrange
        UserRequest updateRequest = new UserRequest();
        updateRequest.setEmail("updated@aims.com");
        updateRequest.setStatus(UserStatus.LOCKED);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("updated@aims.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserResponse response = userService.updateUser(1L, updateRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(testUser.getEmail()).isEqualTo("updated@aims.com");
        assertThat(testUser.getStatus()).isEqualTo(UserStatus.LOCKED);

        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Update User - Fail when user not found")
    void updateUser_WhenUserNotFound_ShouldThrowNotFoundException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.updateUser(999L, userRequest))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update User - Fail when email already taken by another user")
    void updateUser_WithDuplicateEmail_ShouldThrowBusinessException() {
        // Arrange
        User anotherUser = new User();
        anotherUser.setId(2L);
        anotherUser.setEmail("another@aims.com");

        UserRequest updateRequest = new UserRequest();
        updateRequest.setEmail("another@aims.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("another@aims.com")).thenReturn(Optional.of(anotherUser));

        // Act & Assert
        assertThatThrownBy(() -> userService.updateUser(1L, updateRequest))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Email already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update User - Should encode password when provided")
    void updateUser_WithNewPassword_ShouldEncodePassword() {
        // Arrange
        UserRequest updateRequest = new UserRequest();
        updateRequest.setPassword("newPassword123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword123")).thenReturn("$2a$10$newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        userService.updateUser(1L, updateRequest);

        // Assert
        assertThat(testUser.getPassword()).isEqualTo("$2a$10$newEncodedPassword");
        verify(passwordEncoder).encode("newPassword123");
    }

    // ==================== GET USER TESTS ====================

    @Test
    @DisplayName("Get User - Success when user exists")
    void getUser_WhenUserExists_ShouldReturnUserResponse() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        UserResponse response = userService.getUser(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@aims.com");
        assertThat(response.getStatus()).isEqualTo(UserStatus.ACTIVE);

        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Get User - Fail when user not found")
    void getUser_WhenUserNotFound_ShouldThrowNotFoundException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.getUser(999L))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(999L);
    }

    // ==================== LOCK/UNLOCK USER TESTS ====================

    @Test
    @DisplayName("Lock User - Success")
    void lockUser_ShouldSetStatusToLocked() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserResponse response = userService.lockUser(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(testUser.getStatus()).isEqualTo(UserStatus.LOCKED);

        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Lock User - Fail when user not found")
    void lockUser_WhenUserNotFound_ShouldThrowNotFoundException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.lockUser(999L))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Unlock User - Success")
    void unlockUser_ShouldSetStatusToActive() {
        // Arrange
        testUser.setStatus(UserStatus.LOCKED);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserResponse response = userService.unlockUser(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(testUser.getStatus()).isEqualTo(UserStatus.ACTIVE);

        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Unlock User - Fail when user not found")
    void unlockUser_WhenUserNotFound_ShouldThrowNotFoundException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.unlockUser(999L))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any());
    }

    // ==================== ROLE RESOLUTION TESTS ====================

    @Test
    @DisplayName("Create User - Should create role if it doesn't exist")
    void createUser_WhenRoleDoesNotExist_ShouldCreateRole() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedPassword");
        when(roleRepository.findByName(RoleName.ROLE_CUSTOMER)).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(customerRole);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });

        // Act
        UserResponse response = userService.createUser(userRequest);

        // Assert
        assertThat(response).isNotNull();
        verify(roleRepository).findByName(RoleName.ROLE_CUSTOMER);
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    @DisplayName("Create User - Should handle multiple roles")
    void createUser_WithMultipleRoles_ShouldAssignAllRoles() {
        // Arrange
        userRequest.setRoles(Set.of("ROLE_CUSTOMER", "ROLE_ADMIN"));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedPassword");
        when(roleRepository.findByName(RoleName.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(roleRepository.findByName(RoleName.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });

        // Act
        UserResponse response = userService.createUser(userRequest);

        // Assert
        assertThat(response.getRoles()).containsExactlyInAnyOrder("ROLE_CUSTOMER", "ROLE_ADMIN");
        verify(roleRepository).findByName(RoleName.ROLE_CUSTOMER);
        verify(roleRepository).findByName(RoleName.ROLE_ADMIN);
    }
}
