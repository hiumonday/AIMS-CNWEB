# Cookie-Based Stateless Refresh Tokens

## Overview

Refresh tokens are now **stateless JWT tokens stored in HTTP-only cookies** instead of database records.

## Changes Made

### ✅ What Changed

1. **Removed DB-stored refresh tokens:**

   - ❌ Deleted `RefreshToken` entity
   - ❌ Deleted `RefreshTokenRepository`
   - ❌ Deleted `RefreshTokenService`
   - ❌ Removed migration `006-create-refresh-tokens-table.sql`

2. **Added JWT refresh token generation:**

   - `JwtService.generateRefreshToken()` - Creates JWT with `type: "refresh"`
   - `JwtService.isRefreshToken()` - Validates token type
   - Refresh tokens are JWTs with 7-day expiration

3. **Cookie-based storage:**
   - Refresh tokens stored in HTTP-only cookies
   - Automatic cookie management in `AuthController`
   - Secure, SameSite=Strict cookies

---

## How It Works

### 1. Login Flow

```
POST /auth/login
{
  "email": "admin@aims.com",
  "password": "admin123"
}

Response:
{
  "data": {
    "accessToken": "eyJhbGc...",  // JWT, 15 min
    "refreshToken": "eyJhbGc...", // JWT, 7 days (also in cookie)
    "tokenType": "Bearer",
    "user": {...}
  }
}

Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

### 2. Refresh Flow

```
POST /auth/refresh
Cookie: refreshToken=eyJhbGc...

Response:
{
  "data": {
    "accessToken": "new-jwt...",
    "refreshToken": "new-refresh-jwt...",
    ...
  }
}

Set-Cookie: refreshToken=new-refresh-jwt...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

### 3. Logout Flow

```
POST /auth/logout

Response:
{
  "message": "Logged out successfully"
}

Set-Cookie: refreshToken=; HttpOnly; Secure; Path=/; Max-Age=0
```

---

## Security Features

### ✅ Advantages

1. **HttpOnly cookies** - JavaScript cannot access (XSS protection)
2. **Secure flag** - Only sent over HTTPS (production)
3. **SameSite=Strict** - CSRF protection
4. **Stateless** - No database queries for validation
5. **Scalable** - No DB overhead

### ⚠️ Trade-offs

1. **No immediate revocation** - Tokens valid until expiry
2. **Password change** - Old tokens remain valid (7 days max)
3. **User logout** - Only clears cookie, token still technically valid
4. **Stolen token** - Can't revoke, must wait for expiry

---

## Cookie Configuration

```java
@PostMapping("/login")
public ApiResponse<AuthResponse> login(
    @Valid @RequestBody LoginRequest request,
    HttpServletResponse response
) {
    AuthResponse authResponse = authService.login(request);

    // Set refresh token in HTTP-only cookie
    Cookie cookie = new Cookie("refreshToken", authResponse.getRefreshToken());
    cookie.setHttpOnly(true);      // Prevents JavaScript access
    cookie.setSecure(true);         // HTTPS only (production)
    cookie.setPath("/");
    cookie.setMaxAge(604800);       // 7 days in seconds
    cookie.setAttribute("SameSite", "Strict"); // CSRF protection
    response.addCookie(cookie);

    return ApiResponse.success(authResponse, "Login successful");
}
```

---

## Client-Side Usage

### Frontend (JavaScript/React)

```javascript
// Login - cookies set automatically
const response = await fetch("http://localhost:8080/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // IMPORTANT: Include cookies
  body: JSON.stringify({ email, password }),
});

const { accessToken } = await response.json();
// Store access token in memory or localStorage
localStorage.setItem("accessToken", accessToken);

// Refresh - cookie sent automatically
const refreshResponse = await fetch("http://localhost:8080/auth/refresh", {
  method: "POST",
  credentials: "include", // Sends cookie automatically
});

const { accessToken: newAccessToken } = await refreshResponse.json();
localStorage.setItem("accessToken", newAccessToken);

// Logout - clears cookie
await fetch("http://localhost:8080/auth/logout", {
  method: "POST",
  credentials: "include",
});
localStorage.removeItem("accessToken");
```

---

## Testing with cURL

### Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aims.com","password":"admin123"}' \
  -c cookies.txt  # Save cookies to file
```

### Refresh

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -b cookies.txt  # Send cookies from file
```

### Logout

```bash
curl -X POST http://localhost:8080/auth/logout \
  -b cookies.txt
```

---

## Production Configuration

### application-prod.yml

```yaml
security:
  jwt:
    access-token-expiration: 900000 # 15 minutes
    refresh-token-expiration: 604800000 # 7 days
    secret-key: ${JWT_SECRET_KEY} # From environment variable

server:
  servlet:
    session:
      cookie:
        secure: true # Force HTTPS cookies
```

### CORS Configuration

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("https://yourdomain.com"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true); // IMPORTANT for cookies
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## Mitigating Trade-offs

### Option 1: Shorter Refresh Token TTL

```yaml
security:
  jwt:
    refresh-token-expiration: 86400000 # 1 day instead of 7
```

### Option 2: Token Blacklist (Advanced)

If you need revocation, implement a blacklist:

```java
@Service
public class TokenBlacklistService {
    private final RedisTemplate<String, String> redisTemplate;

    public void blacklistToken(String token, long expirationMs) {
        String tokenId = extractTokenId(token);
        redisTemplate.opsForValue().set(
            "blacklist:" + tokenId,
            "revoked",
            expirationMs,
            TimeUnit.MILLISECONDS
        );
    }

    public boolean isBlacklisted(String token) {
        String tokenId = extractTokenId(token);
        return redisTemplate.hasKey("blacklist:" + tokenId);
    }
}
```

Then check in `JwtAuthenticationFilter`:

```java
if (tokenBlacklistService.isBlacklisted(jwt)) {
    throw new RuntimeException("Token has been revoked");
}
```

### Option 3: Include Password Change Timestamp in JWT

```java
public String generateRefreshToken(UserPrincipal principal, Instant lastPasswordChange) {
    return Jwts.builder()
        .subject(principal.getUsername())
        .claim("userId", principal.getId())
        .claim("type", "refresh")
        .claim("pwdChangeAt", lastPasswordChange.toEpochMilli())
        .issuer(issuer)
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiration))
        .signWith(getSigningKey())
        .compact();
}
```

Then validate:

```java
public boolean isTokenValid(String token, UserDetails userDetails) {
    User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    Long pwdChangeAt = extractClaim(token, claims -> claims.get("pwdChangeAt", Long.class));

    if (user.getLastPasswordChangeAt() != null) {
        long tokenPwdChange = pwdChangeAt != null ? pwdChangeAt : 0;
        long userPwdChange = user.getLastPasswordChangeAt().toInstant(ZoneOffset.UTC).toEpochMilli();

        if (userPwdChange > tokenPwdChange) {
            return false; // Password changed after token issued
        }
    }

    return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
}
```

---

## Comparison: DB-Stored vs Cookie-Based

| Feature             | DB-Stored                | Cookie-Based (Current)  |
| ------------------- | ------------------------ | ----------------------- |
| **Revocation**      | ✅ Immediate             | ❌ Must wait for expiry |
| **Password change** | ✅ Revoke all tokens     | ⚠️ Add timestamp check  |
| **User logout**     | ✅ Revoke specific token | ❌ Client-side only     |
| **Scalability**     | ⚠️ DB queries            | ✅ No DB overhead       |
| **Stolen token**    | ✅ Can revoke            | ⚠️ Blacklist or wait    |
| **Implementation**  | ⚠️ More complex          | ✅ Simpler              |
| **XSS Protection**  | ⚠️ If in localStorage    | ✅ HttpOnly cookies     |
| **CSRF Protection** | ✅ No cookies            | ✅ SameSite=Strict      |

---

## Migration Steps (If Reverting to DB)

If you need to go back to DB-stored tokens:

1. Restore `RefreshToken` entity
2. Restore `RefreshTokenService`
3. Add back migration `006-create-refresh-tokens-table.sql`
4. Update `AuthService` to use `RefreshTokenService`
5. Remove cookie logic from `AuthController`
6. Use request body for refresh tokens

---

## Recommendations

### ✅ Use Cookie-Based If:

- You prioritize scalability
- You have short refresh token TTL (1-2 days)
- You don't need immediate revocation
- You trust JWT expiration for security

### ✅ Use DB-Stored If:

- You need immediate revocation
- You have compliance requirements for audit trails
- You need to track active sessions
- You want to force logout on password change

### 🎯 Hybrid Approach (Best of Both):

- Use cookie-based JWTs
- Add Redis blacklist for revocation
- Include password change timestamp in JWT
- Keep refresh token TTL short (1-2 days)

---

**Your refresh tokens are now stateless and stored in secure HTTP-only cookies!** 🍪🔒
