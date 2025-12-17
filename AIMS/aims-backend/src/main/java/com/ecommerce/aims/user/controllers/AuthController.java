package com.ecommerce.aims.user.controllers;

import com.ecommerce.aims.common.dto.ApiResponse;
import com.ecommerce.aims.user.dto.AuthResponse;
import com.ecommerce.aims.user.dto.ChangePasswordRequest;
import com.ecommerce.aims.user.dto.LoginRequest;
import com.ecommerce.aims.user.dto.UserRequest;
import com.ecommerce.aims.user.dto.UserResponse;
import com.ecommerce.aims.user.services.AuthService;
import com.ecommerce.aims.user.services.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    
    @Value("${security.jwt.refresh-token-expiration:604800000}") // 7 days
    private long refreshTokenExpirationMs;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.login(request);
        
        // Set refresh token in HTTP-only cookie
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        
        return ApiResponse.success(authResponse, "Login successful");
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
        @CookieValue(name = "refreshToken", required = false) String refreshToken,
        HttpServletResponse response
    ) {
        if (refreshToken == null) {
            throw new RuntimeException("Refresh token not found in cookies");
        }
        
        AuthResponse authResponse = authService.refreshAccessToken(refreshToken);
        
        // Set new refresh token in cookie
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        
        return ApiResponse.success(authResponse, "Token refreshed");
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        // Clear refresh token cookie
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(0); // Delete cookie
        response.addCookie(cookie);
        
        return ApiResponse.success(null, "Logged out successfully");
    }
    
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true); // Prevents JavaScript access
        cookie.setSecure(true); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge((int) (refreshTokenExpirationMs / 1000)); // Convert ms to seconds
        cookie.setAttribute("SameSite", "Strict"); // CSRF protection
        response.addCookie(cookie);
    }

    @PostMapping("/change-password")
    public ApiResponse<UserResponse> changePassword(@RequestParam Long userId,
                                                    @Valid @RequestBody ChangePasswordRequest request) {
        return ApiResponse.success(authService.changePassword(userId, request), "Password updated");
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(
        @Valid @RequestBody UserRequest request,
        HttpServletResponse response
    ) {
        // Create user first
        userService.createUser(request);

        // Auto-login newly registered user
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(request.getEmail());
        loginRequest.setPassword(request.getPassword());
        AuthResponse authResponse = authService.login(loginRequest);

        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ApiResponse.success(authResponse, "User registered and logged in");
    }
}
