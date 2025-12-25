import { apiClient } from "./api";

/**
 * Auth response types based on backend API
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  status?: string;
  roles?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

/**
 * Register a new user and receive auth tokens (backend logs in after registration)
 */
export async function register(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    { email, password }
  );

  if (response.data.success && response.data.data?.user?.id) {
    localStorage.setItem("userId", String(response.data.data.user.id));
  }

  return response.data;
}

/**
 * Login with email and password
 * POST /auth/login
 *
 * Backend should set an HTTP-only cookie with the auth token.
 * The cookie will be automatically included in subsequent requests
 * via axios withCredentials: true configuration.
 *
 * @param email - User email
 * @param password - User password
 * @returns Login response with user info
 *
 * @example
 * The cookie will be automatically included in subsequent requests
 * via axios withCredentials: true configuration.
 *
 * @param email - User email
 * @param password - User password
 * @returns Login response with user info
 *
 * @example
 * const result = await authService.login('user@example.com', 'password123');
 * // Cookie is automatically set by backend and managed by browser
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    console.log("Calling login API with email:", email);
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    console.log("Login response received:", response);

    // Check if response conforms to ApiResponse structure (success, message, data)
    const responseBody = response.data as any;

    // If wrapped in ApiResponse structure
    if (responseBody.success && responseBody.data) {
      const authData = responseBody.data;
      if (authData.user?.id) {
        localStorage.setItem("userId", String(authData.user.id));
      }
      if (authData.accessToken) {
        localStorage.setItem("accessToken", authData.accessToken);
      }
      return authData;
    }

    // If not wrapped (legacy or different endpoint behavior)
    if (responseBody.user?.id) {
      localStorage.setItem("userId", String(responseBody.user.id));
      if (responseBody.accessToken) {
        localStorage.setItem("accessToken", responseBody.accessToken);
      }
      return responseBody;
    }

    // Fallback
    return responseBody;
  } catch (error: any) {
    console.error("Login error details:", error);
    console.error("Error response:", error.response);
    console.error("Error request:", error.request);
    console.error("Error message:", error.message);
    throw error;
  }
}

/**
 * Change user password
 * POST /auth/change-password?userId={userId}
 *
 * Requires authentication cookie to be present (set during login).
 *
 * @param userId - User ID
 * @param oldPassword - Current password
 * @param newPassword - New password
 * @returns Success response
 *
 * @example
 * await authService.changePassword(1, 'oldPass123', 'newPass123');
 */
export async function changePassword(
  userId: number | string,
  oldPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ChangePasswordResponse>(
    "/auth/change-password",
    {
      oldPassword,
      newPassword,
    },
    {
      params: { userId },
    }
  );

  return response.data;
}

/**
 * Logout - call backend logout endpoint to clear auth cookie
 * Add this endpoint to your backend if it doesn't exist yet
 */
export async function logout(): Promise<void> {
  try {
    // If you have a logout endpoint on backend:
    // await apiClient.post('/auth/logout');

    // For now, just redirect to login
    // Backend cookie will expire or can be cleared server-side
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  } catch (err) {
    // Even if logout fails, redirect to login
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }
}

/**
 * Check if user is authenticated
 * This should ideally call a backend endpoint to verify the session cookie
 * For now, you can implement a /auth/me or /auth/status endpoint
 */
export async function checkAuth(): Promise<boolean> {
  try {
    // Call a backend endpoint to verify auth status
    // Example: await apiClient.get('/auth/me');
    // For now, return true if no error
    return true;
  } catch (err) {
    return false;
  }
}

// Export as default object for convenience
const authService = {
  login,
  register,
  changePassword,
  logout,
  checkAuth,
};

export default authService;
