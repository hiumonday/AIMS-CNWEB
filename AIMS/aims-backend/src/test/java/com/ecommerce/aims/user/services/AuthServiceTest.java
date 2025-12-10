package com.ecommerce.aims.user.services;

import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.common.exception.NotFoundException;
import com.ecommerce.aims.security.jwt.JwtService;
import com.ecommerce.aims.user.dto.AuthResponse;
import com.ecommerce.aims.user.dto.ChangePasswordRequest;
import com.ecommerce.aims.user.dto.LoginRequest;
import com.ecommerce.aims.user.dto.UserResponse;
import com.ecommerce.aims.user.models.Role;
import com.ecommerce.aims.user.models.RoleName;
import com.ecommerce.aims.user.models.User;
import com.ecommerce.aims.user.models.UserPrincipal;
import com.ecommerce.aims.user.models.UserStatus;
import com.ecommerce.aims.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SuppressWarnings("DataFlowIssue")
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User testUser = new User();
    private Role adminRole = new Role();
    private LoginRequest loginRequest;
    private Authentication authentication;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        // Setup test data
        adminRole = Role.builder()
            .id(1L)
            .name(RoleName.ROLE_ADMIN)
            .build();

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("admin@aims.com");
        testUser.setPassword("$2a$10$encodedPassword");
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setRoles(Set.of(adminRole));

        userPrincipal = new UserPrincipal(testUser);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@aims.com");
        loginRequest.setPassword("admin123");

        authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userPrincipal);
    }

    // ==================== LOGIN TESTS ====================

    @Test
    @DisplayName("Login - Success with valid credentials")
    void login_WithValidCredentials_ShouldReturnAuthResponse() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(any(UserPrincipal.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(UserPrincipal.class))).thenReturn("refresh-token");
        when(jwtService.getAccessTokenExpiration()).thenReturn(Instant.now().plusSeconds(900));

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUser().getEmail()).isEqualTo("admin@aims.com");
        assertThat(response.getUser().getRoles()).contains("ROLE_ADMIN");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findById(1L);
        verify(jwtService).generateAccessToken(any(UserPrincipal.class));
        verify(jwtService).generateRefreshToken(any(UserPrincipal.class));
    }

    @Test
    @DisplayName("Login - Fail with invalid credentials")
    void login_WithInvalidCredentials_ShouldThrowBusinessException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Invalid credentials");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("Login - Fail when user not found after authentication")
    void login_WhenUserNotFoundAfterAuth_ShouldThrowNotFoundException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findById(1L);
        verify(jwtService, never()).generateAccessToken(any());
    }

    // ==================== REFRESH TOKEN TESTS ====================

    @Test
    @DisplayName("Refresh Token - Success with valid refresh token")
    void refreshAccessToken_WithValidToken_ShouldReturnNewTokens() {
        // Arrange
        String refreshToken = "valid-refresh-token";
        when(jwtService.isRefreshToken(refreshToken)).thenReturn(true);
        when(jwtService.extractUsername(refreshToken)).thenReturn("admin@aims.com");
        when(userRepository.findByEmail("admin@aims.com")).thenReturn(Optional.of(testUser));
        when(jwtService.isTokenValid(eq(refreshToken), any(UserPrincipal.class))).thenReturn(true);
        when(jwtService.generateAccessToken(any(UserPrincipal.class))).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(any(UserPrincipal.class))).thenReturn("new-refresh-token");
        when(jwtService.getAccessTokenExpiration()).thenReturn(Instant.now().plusSeconds(900));

        // Act
        AuthResponse response = authService.refreshAccessToken(refreshToken);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");
        assertThat(response.getUser().getEmail()).isEqualTo("admin@aims.com");

        verify(jwtService).isRefreshToken(refreshToken);
        verify(jwtService).extractUsername(refreshToken);
        verify(jwtService).isTokenValid(eq(refreshToken), any(UserPrincipal.class));
        verify(jwtService).generateAccessToken(any(UserPrincipal.class));
        verify(jwtService).generateRefreshToken(any(UserPrincipal.class));
    }

    @Test
    @DisplayName("Refresh Token - Fail with invalid token type")
    void refreshAccessToken_WithInvalidTokenType_ShouldThrowBusinessException() {
        // Arrange
        String invalidToken = "not-a-refresh-token";
        when(jwtService.isRefreshToken(invalidToken)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshAccessToken(invalidToken))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Invalid refresh token");

        verify(jwtService).isRefreshToken(invalidToken);
        verify(jwtService, never()).extractUsername(anyString());
    }

    @Test
    @DisplayName("Refresh Token - Fail when user not found")
    void refreshAccessToken_WhenUserNotFound_ShouldThrowNotFoundException() {
        // Arrange
        String refreshToken = "valid-refresh-token";
        when(jwtService.isRefreshToken(refreshToken)).thenReturn(true);
        when(jwtService.extractUsername(refreshToken)).thenReturn("nonexistent@aims.com");
        when(userRepository.findByEmail("nonexistent@aims.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshAccessToken(refreshToken))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");

        verify(jwtService).isRefreshToken(refreshToken);
        verify(jwtService).extractUsername(refreshToken);
        verify(userRepository).findByEmail("nonexistent@aims.com");
    }

    @Test
    @DisplayName("Refresh Token - Fail when token expired or invalid")
    void refreshAccessToken_WhenTokenExpired_ShouldThrowBusinessException() {
        // Arrange
        String expiredToken = "expired-refresh-token";
        when(jwtService.isRefreshToken(expiredToken)).thenReturn(true);
        when(jwtService.extractUsername(expiredToken)).thenReturn("admin@aims.com");
        when(userRepository.findByEmail("admin@aims.com")).thenReturn(Optional.of(testUser));
        when(jwtService.isTokenValid(eq(expiredToken), any(UserPrincipal.class))).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshAccessToken(expiredToken))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Refresh token expired or invalid");

        verify(jwtService).isTokenValid(eq(expiredToken), any(UserPrincipal.class));
        verify(jwtService, never()).generateAccessToken(any());
    }

    // ==================== CHANGE PASSWORD TESTS ====================

    @Test
    @DisplayName("Change Password - Success with valid old password")
    void changePassword_WithValidOldPassword_ShouldUpdatePassword() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("admin123");
        request.setNewPassword("newPassword123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("admin123", testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("$2a$10$newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserResponse response = authService.changePassword(1L, request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("admin@aims.com");
        assertThat(testUser.getLastPasswordChangeAt()).isNotNull();

        verify(userRepository).findById(1L);
        verify(passwordEncoder).matches("admin123", testUser.getPassword());
        verify(passwordEncoder).encode("newPassword123");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Change Password - Fail when user not found")
    void changePassword_WhenUserNotFound_ShouldThrowNotFoundException() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("admin123");
        request.setNewPassword("newPassword123");

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.changePassword(999L, request))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(999L);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Change Password - Fail when user is locked")
    void changePassword_WhenUserLocked_ShouldThrowBusinessException() {
        // Arrange
        testUser.setStatus(UserStatus.LOCKED);
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("admin123");
        request.setNewPassword("newPassword123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> authService.changePassword(1L, request))
            .isInstanceOf(BusinessException.class)
            .hasMessage("User is locked");

        verify(userRepository).findById(1L);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Change Password - Fail when old password is incorrect")
    void changePassword_WithIncorrectOldPassword_ShouldThrowBusinessException() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrongPassword");
        request.setNewPassword("newPassword123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", testUser.getPassword())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.changePassword(1L, request))
            .isInstanceOf(BusinessException.class)
            .hasMessage("Old password incorrect");

        verify(userRepository).findById(1L);
        verify(passwordEncoder).matches("wrongPassword", testUser.getPassword());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }
}
