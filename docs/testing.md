# 🧪 Testing Guide

This document describes the testing strategy used in the MoveOn B2C e-commerce platform.

The project includes:
- Unit tests
- Integration tests
- End-to-End (E2E) tests
- Security tests
- Manual tests for third-party integrations and authentication flows

The testing environment uses:
- **Jest** for unit and integration testing
- **Supertest** for HTTP endpoint testing
- **@nestjs/testing** for NestJS application test setup

This testing strategy ensures that business logic, API endpoints, authentication flows, and security mechanisms behave correctly.

---

# 1. Unit Tests

Unit tests validate individual services, DTO validation, token handling, and data structures.

## 1.1 JWT Token Handling

Test file:
```
src/auth/tokens.service.spec.ts
```

These tests verify:
- Access token generation
- Refresh token generation
- Refresh token validation
- Temporary 2FA token generation
- Temporary 2FA token validation
- Invalid signature rejection
- Expired token rejection

These tests ensure that JWT tokens are generated and validated securely.

---

## 1.2 User Input Validation

DTO validation tests ensure that user input is validated before reaching the business logic layer.

DTO validation test files:
```
src/auth/dto/register.dto.spec.ts
src/auth/dto/login.dto.spec.ts
```

These tests verify:
- Required fields validation
- Email format validation
- Password validation rules
- Missing fields handling
- Invalid payload rejection
- Valid payload acceptance

This prevents invalid or malicious input from reaching the application logic.

---

## 1.3 Product Data Model and Query Validation

DTO test file:
```
src/modules/products/dto/products.querries.spec.ts
```

These tests verify:
- Product data structure validation
- Required product fields
- Price and numeric validation
- Enum validation
- Pagination parameters validation
- Filtering parameters validation
- Sorting parameters validation
- Query parameter transformation
- Array transformation for filters
- Numeric transformation from query strings

These tests ensure product filtering, sorting, and pagination parameters are correctly validated and transformed.

---

# 2. API Integration Tests

Integration tests validate HTTP endpoints through the NestJS application.

Auth e2e test file:
```
test/auth.e2e-spec.ts
```

These tests verify:
- `POST /auth/register` creates a new user
- `POST /auth/register` rejects mismatched passwords
- `POST /auth/login` authenticates a valid user
- `POST /auth/login` rejects invalid credentials
- `POST /auth/refresh` returns a new access token when refresh cookie is present
- `POST /auth/logout` revokes the current session

These tests also verify:
- Request validation through global validation pipes
- Refresh token cookie handling
- Full request/response flow through controllers and services
- Integration with the database layer
- Correct status codes and response payloads

For test stability:
- CAPTCHA verification is mocked
- Unique test emails are used
- Cookie parsing is enabled in the test application setup

These tests ensure that authentication endpoints behave correctly in a real HTTP environment.

---

# 3. Security Tests

Security tests verify authentication logic, token handling, session management, and input validation protections.

## 3.1 Authentication Service Security Tests

Service test file:
```
src/auth/auth.service.spec.ts
```

These tests verify:
- Password hashing and password comparison
- User registration validation
- Login credential validation
- Handling OAuth-only accounts
- 2FA login flow returning temporary token
- Refresh token validation
- Refresh token rotation
- Refresh token reuse detection and session revocation
- Session creation and session revocation
- Password reset token validation
- Password reset invalid/expired token handling
- Account setup password update validation

These tests ensure authentication logic and session security rules are correctly enforced.

---

## 3.2 Input Validation Security Tests

Security e2e test file:
```
test/auth.security.e2e-spec.ts
```

These tests verify:
- Rejection of malformed authentication payloads
- Rejection of invalid email formats
- Rejection of missing required fields
- Rejection of unexpected fields
- Rejection of malformed payload types
- Rejection of requests without required refresh cookies
- Proper handling of invalid refresh tokens
- No leakage of sensitive authentication details in error responses
- CAPTCHA failure handling
- Protection against invalid authentication payloads
- Brute-force mitigation through rate limiting

These tests ensure authentication endpoints are protected against malformed input and common attack patterns.

---

# 4. Running Tests (Docker)

Tests are executed inside the backend Docker container.

Run specific tests:

```bash
# JWT service
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/tokens.service.spec.ts"

# Register DTO
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/dto/register.dto.spec.ts"

# Login DTO
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/dto/login.dto.spec.ts"

# Product DTO
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/modules/products/dto/products.querries.spec.ts"

# Auth service
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/auth.service.spec.ts"

# Auth e2e
docker compose exec backend sh -c "cd /app/backend && npm run test:e2e -- test/auth.e2e-spec.ts"

# Auth security e2e
docker compose exec backend sh -c "cd /app/backend && npm run test:e2e -- test/auth.security.e2e-spec.ts"
```

---

# 5. Manual Tests

Automated tests cover business logic and API behavior, but some security-critical flows require manual testing.

## 5.1 CAPTCHA Verification

Manual checks:
- CAPTCHA appears on registration page
- Registration succeeds when CAPTCHA is valid
- Registration fails when CAPTCHA is missing or invalid
- Error messages are clear
- CAPTCHA works on different browsers

---

## 5.2 OAuth Integration

Manual checks:
- User can start Google sign-in
- User is redirected to Google login
- Successful login returns user to application
- OAuth login works for new users
- OAuth login works for existing users
- Logout works after OAuth login
- Errors are handled correctly

---

## 5.3 Two-Factor Authentication (2FA)

Manual checks:
- User can open 2FA setup
- QR code or secret is generated
- Authenticator app accepts secret
- Confirmation code enables 2FA
- Login requires 2FA when enabled
- Login succeeds with valid 2FA code
- Login fails with invalid code
- 2FA can be disabled securely

---

# 6. Manual Testing Frequency

Manual tests should be performed:
- After authentication changes
- After UI changes affecting login/registration
- After OAuth, CAPTCHA, or 2FA changes
- Before major releases

Manual testing ensures real-world behavior and third-party integrations work correctly.