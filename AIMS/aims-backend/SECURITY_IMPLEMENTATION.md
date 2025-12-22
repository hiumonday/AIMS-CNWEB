# JWT Authentication + RBAC Implementation

## Overview

Complete JWT-based authentication and Role-Based Access Control (RBAC) system with table-backed permissions for the AIMS backend.

## Architecture

### Module Structure

- **`com.ecommerce.aims.user`** - User domain module

  - Entities: `User`, `Role`, `Permission`
  - Enums: `RoleName`, `PermissionObject`, `PermissionAction`
  - Services: `UserService`, `AuthService`
  - Controllers: `AuthController`, `UserAdminController`

- **`com.ecommerce.aims.security`** - Security infrastructure module
  - JWT: `JwtService`, `JwtAuthenticationFilter`
  - Tokens: `RefreshToken`, `RefreshTokenService`
  - Config: `SecurityConfig`
  - Handlers: `CustomAccessDeniedHandler`, `CustomAuthenticationEntryPoint`

## Database Schema

### Tables

1. **`users`**

   - `id`, `email`, `password`, `status`, `last_password_change_at`, `created_at`, `updated_at`

2. **`roles`**

   - `id`, `name` (enum: `ROLE_ADMIN`, `ROLE_PRODUCT_MANAGER`, `ROLE_CUSTOMER`)

3. **`permissions`**

   - `id`, `object` (USER, PRODUCT, ORDER, STOCK), `action` (READ, WRITE, DELETE, BLOCK, ROLE_MANAGE, ADJUST, REVIEW)
   - Unique constraint on `(object, action)`

4. **`user_roles`** (join table)

   - `user_id`, `role_id`

5. **`role_permissions`** (join table)

   - `role_id`, `permission_id`

6. **`refresh_tokens`**
   - `id`, `user_id`, `token`, `expires_at`, `revoked`, `created_at`

## Roles & Permissions

### Role Mappings

**ROLE_ADMIN** (all permissions):

- `USER:READ`, `USER:WRITE`, `USER:ROLE_MANAGE`, `USER:BLOCK`
- `PRODUCT:READ`, `PRODUCT:WRITE`, `PRODUCT:DELETE`
- `STOCK:ADJUST`
- `ORDER:REVIEW`

**ROLE_PRODUCT_MANAGER**:

- `PRODUCT:READ`, `PRODUCT:WRITE`, `PRODUCT:DELETE`
- `STOCK:ADJUST`
- `ORDER:REVIEW`

**ROLE_CUSTOMER**:

- `PRODUCT:READ`

## API Endpoints

### Authentication

**POST `/auth/login`**

```json
Request:
{
  "email": "admin@aims.com",
  "password": "admin123"
}

Response:
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "uuid-token",
    "tokenType": "Bearer",
    "accessTokenExpiresAt": "2024-...",
    "user": {
      "id": 1,
      "email": "admin@aims.com",
      "status": "ACTIVE",
      "roles": ["ROLE_ADMIN"]
    }
  },
  "message": "Login successful"
}
```

**POST `/auth/refresh`**

```json
Request:
{
  "refreshToken": "uuid-token"
}

Response: (same as login)
```

**POST `/auth/logout`**

```json
Request:
{
  "refreshToken": "uuid-token"
}
```

### Protected Endpoints

All protected endpoints require:

```
Authorization: Bearer <access_token>
```

## Security Configuration

### Public Endpoints

- `/auth/**` - Authentication endpoints
- `GET /products/**` - Product browsing
- `GET /categories/**` - Category browsing
- `GET /search/**` - Search
- `POST /cart/**` - Cart operations
- `POST /checkout/**` - Checkout
- `/payment/callback/**` - Payment callbacks

### Admin Only

- `/admin/users/**` - User management

### Admin + Product Manager

- `POST/PUT/DELETE /products/**` - Product management
- `/stock/**` - Stock adjustment
- `/orders/pending/**` - Order review
- `POST /orders/*/approve` - Approve orders
- `POST /orders/*/reject` - Reject orders

## JWT Configuration

In `application.yml`:

```yaml
security:
  jwt:
    secret-key: ${JWT_SECRET_KEY:...}
    access-token-expiration: 900000 # 15 minutes
    refresh-token-expiration: 604800000 # 7 days
    issuer: aims-backend
```

### JWT Claims

Access tokens contain:

- `sub`: username (email)
- `userId`: user ID
- `roles`: array of role names (e.g., `["ROLE_ADMIN"]`)
- `iss`: issuer
- `iat`: issued at
- `exp`: expiration

## Default Credentials

On first startup, the system creates:

**Admin User:**

- Email: `admin@aims.com`
- Password: `admin123`
- Role: `ROLE_ADMIN`

**⚠️ Change this password immediately in production!**

## Security Features

### Token Management

- **Access tokens**: Short-lived (15 min), stateless JWT
- **Refresh tokens**: Long-lived (7 days), stored in DB, revocable
- **Automatic revocation**: All refresh tokens revoked on password change or user block

### Password Security

- BCrypt hashing with default strength (10 rounds)
- Password change tracking via `last_password_change_at`

### CORS

Configured for:

- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

Update in `SecurityConfig.corsConfigurationSource()` for production.

### CSRF

Disabled for stateless JWT API (standard practice).

## Usage Examples

### 1. Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aims.com","password":"admin123"}'
```

### 2. Access Protected Endpoint

```bash
curl http://localhost:8080/admin/users \
  -H "Authorization: Bearer eyJhbGc..."
```

### 3. Refresh Token

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"uuid-token"}'
```

### 4. Logout

```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"uuid-token"}'
```

## Method-Level Security

Use `@PreAuthorize` for fine-grained control:

```java
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyMethod() { ... }

@PreAuthorize("hasAnyRole('ADMIN','PRODUCT_MANAGER')")
public void productManagementMethod() { ... }

// Future: permission-based
@PreAuthorize("hasAuthority('PERM_USER:WRITE')")
public void userWriteMethod() { ... }
```

## Testing

### Run the Application

```bash
cd aims-backend
./mvnw spring-boot:run
```

### Test Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aims.com","password":"admin123"}'
```

### Verify Swagger UI

Navigate to: `http://localhost:8080/swagger-ui.html`

## Next Steps

1. **Add audit logging** for sensitive operations (product CRUD, stock adjust, order review)
2. **Implement admin user management endpoints** in `UserAdminController`
3. **Add email notifications** for admin actions (user created, blocked, role changed)
4. **Create integration tests** for auth flow and RBAC rules
5. **Add rate limiting** for login endpoint
6. **Implement password reset** flow with email verification
7. **Add 2FA** for admin accounts (optional)

## Troubleshooting

### JWT Secret Key Too Short

Error: `The specified key byte array is X bits which is not secure enough...`

Solution: Ensure `JWT_SECRET_KEY` is at least 256 bits (32 characters) for HS256.

### 401 Unauthorized on Protected Endpoints

- Check token is included: `Authorization: Bearer <token>`
- Verify token hasn't expired (15 min default)
- Check user status is `ACTIVE` and not `LOCKED`

### 403 Forbidden

- User authenticated but lacks required role/permission
- Check role assignments in database
- Verify `SecurityConfig` route rules

### Refresh Token Expired/Revoked

- Refresh tokens expire after 7 days
- Revoked on password change or logout
- User must login again

## Security Best Practices

✅ **Implemented:**

- Short-lived access tokens
- Refresh token rotation capability
- Password hashing with BCrypt
- Stateless authentication
- CORS configuration
- Role-based access control
- Permission-based authorization ready

⚠️ **Production Checklist:**

- [ ] Change default admin password
- [ ] Set strong `JWT_SECRET_KEY` (env variable)
- [ ] Configure production CORS origins
- [ ] Enable HTTPS only
- [ ] Add rate limiting
- [ ] Implement audit logging
- [ ] Set up monitoring/alerts
- [ ] Regular security updates

## Files Created/Modified

### New Files (Security Module)

- `security/SecurityConfig.java`
- `security/jwt/JwtService.java`
- `security/jwt/JwtAuthenticationFilter.java`
- `security/token/RefreshToken.java`
- `security/token/RefreshTokenRepository.java`
- `security/token/RefreshTokenService.java`
- `security/handlers/CustomAccessDeniedHandler.java`
- `security/handlers/CustomAuthenticationEntryPoint.java`

### New Files (User Module)

- `user/models/RoleName.java`
- `user/models/PermissionObject.java`
- `user/models/PermissionAction.java`
- `user/models/Permission.java`
- `user/repository/PermissionRepository.java`
- `user/dto/AuthResponse.java`
- `user/dto/RefreshTokenRequest.java`

### New Files (Config)

- `config/DataInitializer.java`

### Modified Files

- `pom.xml` - Added JWT dependencies
- `application.yml` - Added JWT configuration
- `user/models/User.java` - Added `lastPasswordChangeAt`
- `user/models/Role.java` - Changed to enum, added permissions
- `user/models/UserPrincipal.java` - Added permission authorities
- `user/repository/RoleRepository.java` - Updated to use `RoleName`
- `user/services/AuthService.java` - Added JWT token generation
- `user/services/UserService.java` - Fixed role resolution
- `user/controllers/AuthController.java` - Added refresh/logout endpoints
