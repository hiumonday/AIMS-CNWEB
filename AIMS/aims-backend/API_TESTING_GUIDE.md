# AIMS Backend API Testing Guide

## 🔍 Code Review: User Creation & Login

### ✅ User Creation Flow (`POST /auth/register`)

**Controller:** `AuthController.register()`

```java
@PostMapping("/register")
public ApiResponse<UserResponse> register(@Valid @RequestBody UserRequest request)
```

**Service:** `UserService.createUser()`

**Validation:**

- ✅ Email required & valid format (`@Email @NotBlank`)
- ✅ Password required & min 6 chars (`@NotBlank @Size(min = 6)`)
- ✅ Duplicate email check (throws `BusinessException`)
- ✅ Password BCrypt hashing
- ✅ Default status: `ACTIVE`
- ✅ Role resolution with validation

**Process:**

1. Validate email & password not null
2. Check email doesn't exist
3. Create user entity
4. Hash password with BCrypt
5. Set status (default: ACTIVE)
6. Resolve roles (validates enum, creates if missing)
7. Save to database
8. Return UserResponse (id, email, status, roles)

**Potential Issues:**

- ⚠️ **No email verification** - Users can register with any email
- ⚠️ **Weak password policy** - Only 6 chars minimum
- ⚠️ **Auto-role creation** - `resolveRoles` creates roles if missing (could be exploited)
- ⚠️ **No rate limiting** - Could be spammed

**Recommendations:**

1. Add email verification flow
2. Strengthen password requirements (uppercase, numbers, special chars)
3. Don't auto-create roles - only assign existing ones
4. Add rate limiting on registration endpoint

---

### ✅ Login Flow (`POST /auth/login`)

**Controller:** `AuthController.login()`

```java
@PostMapping("/login")
public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response)
```

**Service:** `AuthService.login()`

**Process:**

1. Authenticate via `AuthenticationManager` (Spring Security)
2. Load `UserPrincipal` with roles + permissions
3. Generate JWT access token (15 min, contains roles)
4. Generate JWT refresh token (7 days, type="refresh")
5. Set refresh token in HTTP-only cookie
6. Return `AuthResponse` with access token + user info

**Security Features:**

- ✅ BCrypt password verification
- ✅ Spring Security authentication
- ✅ JWT with roles in claims
- ✅ Refresh token in HTTP-only cookie (XSS protection)
- ✅ Secure & SameSite=Strict cookies (CSRF protection)
- ✅ Logging for audit trail
- ✅ **Stateless refresh tokens** (no database storage)

**Potential Issues:**

- ⚠️ **No account lockout** - Unlimited login attempts
- ⚠️ **No 2FA** - Single factor authentication only
- ⚠️ **Locked users can attempt login** - Check happens in `UserPrincipal.isEnabled()`
- ⚠️ **Generic error message** - "Invalid credentials" (good for security, but no detail)
- ⚠️ **No token revocation** - Stateless tokens valid until expiry

**Recommendations:**

1. Add rate limiting (e.g., 5 attempts per 15 minutes)
2. Add account lockout after X failed attempts
3. Consider 2FA for admin accounts
4. Log failed login attempts for monitoring
5. Implement Redis blacklist for token revocation if needed

---

## 📬 Postman API Tests

### Environment Setup

Create a Postman environment with these variables:

```
baseUrl: http://localhost:8080
accessToken: (auto-set by tests)
userId: (auto-set by tests)
```

---

## 1️⃣ User Registration Tests

### ✅ Test 1: Register New Customer

**Request:**

```
POST {{baseUrl}}/auth/register
Content-Type: application/json

Body:
{
  "email": "customer@test.com",
  "password": "password123",
  "roles": ["ROLE_CUSTOMER"]
}
```

**Expected Response (200):**

```json
{
  "data": {
    "id": 2,
    "email": "customer@test.com",
    "status": "ACTIVE",
    "roles": ["ROLE_CUSTOMER"]
  },
  "message": "User registered"
}
```

**Postman Test Script:**

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("User created successfully", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property("id");
  pm.expect(jsonData.data.email).to.eql("customer@test.com");
  pm.expect(jsonData.data.status).to.eql("ACTIVE");
  pm.expect(jsonData.data.roles).to.include("ROLE_CUSTOMER");

  // Save user ID for later tests
  pm.environment.set("customerId", jsonData.data.id);
});
```

---

### ✅ Test 2: Register Product Manager

**Request:**

```
POST {{baseUrl}}/auth/register

Body:
{
  "email": "manager@test.com",
  "password": "manager123",
  "roles": ["ROLE_PRODUCT_MANAGER"]
}
```

**Expected Response (200):**

```json
{
  "data": {
    "id": 3,
    "email": "manager@test.com",
    "status": "ACTIVE",
    "roles": ["ROLE_PRODUCT_MANAGER"]
  },
  "message": "User registered"
}
```

---

### ✅ Test 3: Register Admin

**Request:**

```
POST {{baseUrl}}/auth/register

Body:
{
  "email": "newadmin@test.com",
  "password": "admin123456",
  "roles": ["ROLE_ADMIN"]
}
```

---

### ❌ Test 4: Register with Duplicate Email (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/register

Body:
{
  "email": "admin@aims.com",
  "password": "password123"
}
```

**Expected Response (400):**

```json
{
  "message": "Email already exists"
}
```

**Test Script:**

```javascript
pm.test("Duplicate email rejected", function () {
  pm.response.to.have.status(400);
  var jsonData = pm.response.json();
  pm.expect(jsonData.message).to.include("Email already exists");
});
```

---

### ❌ Test 5: Register with Invalid Email (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/register

Body:
{
  "email": "not-an-email",
  "password": "password123"
}
```

**Expected Response (400):**
Validation error for email format

---

### ❌ Test 6: Register with Short Password (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/register

Body:
{
  "email": "test@test.com",
  "password": "12345"
}
```

**Expected Response (400):**
Validation error: password must be at least 6 characters

---

### ❌ Test 7: Register with Invalid Role (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/register

Body:
{
  "email": "test@test.com",
  "password": "password123",
  "roles": ["ROLE_INVALID"]
}
```

**Expected Response (400):**

```json
{
  "message": "Invalid role name: ROLE_INVALID"
}
```

---

## 2️⃣ Login Tests

### ✅ Test 8: Login as Admin (Default User)

**Request:**

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@aims.com",
  "password": "admin123"
}
```

**Expected Response (200):**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "accessTokenExpiresAt": "2024-12-09T01:15:00Z",
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

**Response Headers:**

```
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

**Test Script:**

```javascript
pm.test("Login successful", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property("accessToken");
  pm.expect(jsonData.data).to.have.property("refreshToken");
  pm.expect(jsonData.data.tokenType).to.eql("Bearer");
  pm.expect(jsonData.data.user.email).to.eql("admin@aims.com");
  pm.expect(jsonData.data.user.roles).to.include("ROLE_ADMIN");
});

pm.test("Save access token", function () {
  var jsonData = pm.response.json();
  pm.environment.set("accessToken", jsonData.data.accessToken);
  pm.environment.set("userId", jsonData.data.user.id);
});

pm.test("Refresh token cookie is set", function () {
  pm.expect(pm.cookies.has("refreshToken")).to.be.true;
});
```

---

### ✅ Test 9: Login as Customer

**Request:**

```
POST {{baseUrl}}/auth/login

Body:
{
  "email": "customer@test.com",
  "password": "password123"
}
```

---

### ✅ Test 10: Login as Product Manager

**Request:**

```
POST {{baseUrl}}/auth/login

Body:
{
  "email": "manager@test.com",
  "password": "manager123"
}
```

---

### ❌ Test 11: Login with Wrong Password (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/login

Body:
{
  "email": "admin@aims.com",
  "password": "wrongpassword"
}
```

**Expected Response (400):**

```json
{
  "message": "Invalid credentials"
}
```

**Test Script:**

```javascript
pm.test("Invalid credentials rejected", function () {
  pm.response.to.have.status(400);
  var jsonData = pm.response.json();
  pm.expect(jsonData.message).to.include("Invalid credentials");
});
```

---

### ❌ Test 12: Login with Non-existent User (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/login

Body:
{
  "email": "nonexistent@test.com",
  "password": "password123"
}
```

**Expected Response (400):**

```json
{
  "message": "Invalid credentials"
}
```

---

## 3️⃣ Token Refresh Tests

### ✅ Test 13: Refresh Access Token

**Request:**

```
POST {{baseUrl}}/auth/refresh
```

**Note:** Cookie automatically sent by Postman from login response

**Expected Response (200):**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "accessTokenExpiresAt": "2024-12-09T01:30:00Z",
    "user": {
      "id": 1,
      "email": "admin@aims.com",
      "status": "ACTIVE",
      "roles": ["ROLE_ADMIN"]
    }
  },
  "message": "Token refreshed"
}
```

**Test Script:**

```javascript
pm.test("Token refreshed successfully", function () {
  pm.response.to.have.status(200);
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property("accessToken");

  // Update access token
  pm.environment.set("accessToken", jsonData.data.accessToken);
});

pm.test("New refresh token cookie set", function () {
  pm.expect(pm.cookies.has("refreshToken")).to.be.true;
});
```

---

### ❌ Test 14: Refresh Without Cookie (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/refresh
```

_Manually remove cookie before sending_

**Expected Response (400):**

```json
{
  "message": "Refresh token not found in cookies"
}
```

---

## 4️⃣ Logout Tests

### ✅ Test 15: Logout

**Request:**

```
POST {{baseUrl}}/auth/logout
```

**Expected Response (200):**

```json
{
  "data": null,
  "message": "Logged out successfully"
}
```

**Response Headers:**

```
Set-Cookie: refreshToken=; HttpOnly; Secure; Path=/; Max-Age=0
```

**Test Script:**

```javascript
pm.test("Logout successful", function () {
  pm.response.to.have.status(200);
});

pm.test("Refresh token cookie cleared", function () {
  // Cookie should be deleted (Max-Age=0)
  var cookie = pm.cookies.get("refreshToken");
  pm.expect(cookie).to.be.undefined;
});
```

---

## 5️⃣ Protected Endpoint Tests

### ✅ Test 16: Access Protected Endpoint with Valid Token

**Request:**

```
GET {{baseUrl}}/admin/users
Authorization: Bearer {{accessToken}}
```

**Expected Response (200):**
List of users (if endpoint exists)

**Test Script:**

```javascript
pm.test("Authenticated request successful", function () {
  pm.response.to.have.status(200);
});
```

---

### ❌ Test 17: Access Protected Endpoint Without Token (Should Fail)

**Request:**

```
GET {{baseUrl}}/admin/users
```

_No Authorization header_

**Expected Response (401):**

```json
{
  "timestamp": "2024-12-09T01:00:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required",
  "path": "/admin/users"
}
```

---

### ❌ Test 18: Access Admin Endpoint as Customer (Should Fail)

**Request:**

```
GET {{baseUrl}}/admin/users
Authorization: Bearer {{customerAccessToken}}
```

_Use token from customer login_

**Expected Response (403):**

```json
{
  "timestamp": "2024-12-09T01:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/admin/users"
}
```

---

## 6️⃣ Password Change Tests

### ✅ Test 19: Change Password

**Request:**

```
POST {{baseUrl}}/auth/change-password?userId={{userId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body:
{
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}
```

**Expected Response (200):**

```json
{
  "data": {
    "id": 1,
    "email": "admin@aims.com",
    "status": "ACTIVE",
    "roles": ["ROLE_ADMIN"]
  },
  "message": "Password updated"
}
```

---

### ✅ Test 20: Login with New Password

**Request:**

```
POST {{baseUrl}}/auth/login

Body:
{
  "email": "admin@aims.com",
  "password": "newpassword123"
}
```

**Expected:** Should succeed

---

### ❌ Test 21: Login with Old Password (Should Fail)

**Request:**

```
POST {{baseUrl}}/auth/login

Body:
{
  "email": "admin@aims.com",
  "password": "admin123"
}
```

**Expected Response (400):**

```json
{
  "message": "Invalid credentials"
}
```

---

## 🧪 Complete Test Sequence

Run these tests in order for full coverage:

1. ✅ Register Customer
2. ✅ Register Product Manager
3. ✅ Register Admin
4. ❌ Register Duplicate Email (fail)
5. ❌ Register Invalid Email (fail)
6. ❌ Register Short Password (fail)
7. ❌ Register Invalid Role (fail)
8. ✅ Login as Admin
9. ✅ Login as Customer
10. ✅ Login as Manager
11. ❌ Login Wrong Password (fail)
12. ❌ Login Non-existent User (fail)
13. ✅ Refresh Token
14. ❌ Refresh Without Cookie (fail)
15. ✅ Logout
16. ✅ Access Protected with Token
17. ❌ Access Protected Without Token (fail)
18. ❌ Access Admin as Customer (fail)
19. ✅ Change Password
20. ✅ Login with New Password
21. ❌ Login with Old Password (fail)

**Total: 21 tests (14 success, 7 failure scenarios)**

---

## 📊 Postman Collection JSON

Import this into Postman:

```json
{
  "info": {
    "name": "AIMS Authentication API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8080" },
    { "key": "accessToken", "value": "" },
    { "key": "userId", "value": "" }
  ],
  "item": [
    {
      "name": "1. User Registration",
      "item": [
        {
          "name": "Register Customer",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"customer@test.com\",\n  \"password\": \"password123\",\n  \"roles\": [\"ROLE_CUSTOMER\"]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Status code is 200', function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "pm.test('User created', function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set('customerId', jsonData.data.id);",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "Register Duplicate Email (Fail)",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@aims.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Duplicate email rejected', function () {",
                  "    pm.response.to.have.status(400);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "2. Login",
      "item": [
        {
          "name": "Login as Admin",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@aims.com\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Login successful', function () {",
                  "    pm.response.to.have.status(200);",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set('accessToken', jsonData.data.accessToken);",
                  "    pm.environment.set('userId', jsonData.data.user.id);",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "Login Wrong Password (Fail)",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@aims.com\",\n  \"password\": \"wrongpassword\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Invalid credentials rejected', function () {",
                  "    pm.response.to.have.status(400);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "3. Token Management",
      "item": [
        {
          "name": "Refresh Token",
          "request": {
            "method": "POST",
            "url": {
              "raw": "{{baseUrl}}/auth/refresh",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "refresh"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Token refreshed', function () {",
                  "    pm.response.to.have.status(200);",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set('accessToken', jsonData.data.accessToken);",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "url": {
              "raw": "{{baseUrl}}/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "logout"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Logout successful', function () {",
                  "    pm.response.to.have.status(200);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🚀 Quick Start

1. **Start Application:**

   ```bash
   cd aims-backend
   ./mvnw spring-boot:run
   ```

2. **Import Collection:**

   - Copy JSON above
   - Postman → Import → Raw Text → Paste

3. **Create Environment:**

   - Name: `AIMS Local`
   - Variable: `baseUrl` = `http://localhost:8080`

4. **Run Tests:**

   - Use Postman Collection Runner
   - Or run individually

5. **Default Credentials:**
   - Email: `admin@aims.com`
   - Password: `admin123`

---

## ⚠️ Security Recommendations

### Critical (Implement ASAP)

1. ✅ **Rate Limiting** - Prevent brute force (e.g., Spring Security rate limiter)
2. ✅ **Account Lockout** - Lock after 5 failed attempts
3. ✅ **Email Verification** - Verify email before activation
4. ✅ **Stronger Password Policy** - Min 8 chars, uppercase, numbers, special

### Important

5. ✅ **Don't Auto-Create Roles** - Only assign existing roles in DB
6. ✅ **Audit Logging** - Log all auth events to database
7. ✅ **2FA for Admins** - Add TOTP/SMS verification

### Nice to Have

8. ✅ **Token Blacklist** - Redis-based revocation for stateless tokens
9. ✅ **IP Whitelisting** - For admin accounts
10. ✅ **Device Tracking** - Remember trusted devices

---

## 📝 Notes

- **Refresh tokens are stateless JWTs** stored in HTTP-only cookies
- **No database storage** for refresh tokens (trade-off: no immediate revocation)
- **Cookie settings:** HttpOnly, Secure (prod), SameSite=Strict
- **Access token:** 15 minutes expiration
- **Refresh token:** 7 days expiration
- **All passwords:** BCrypt hashed with strength 10

---

**Your authentication API is ready for testing!** 🚀🔐
