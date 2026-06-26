# Automated Tests

This document describes the automated tests implemented in the MoveOn project and clearly identifies the areas that are not fully covered yet.

The goal of these tests is to verify the most important parts of the application, including authentication, validation, cart logic, checkout, order calculations, stock handling, and security behavior.

---

# 1. Unit Tests

Unit tests validate isolated parts of the backend application such as services, DTO validation, token handling, cart calculations, and order summary logic.

---

## 1.1 JWT Token Handling

Test file:

```text
src/auth/tokens.service.spec.ts
```
Run test:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/tokens.service.spec.ts"
```

Covered cases:

```text
✓ Access token generation
✓ Refresh token generation
✓ Refresh token validation
✓ Temporary 2FA token generation
✓ Temporary 2FA token validation
✓ Invalid signature rejection
✓ Expired token rejection
```



These tests ensure that JWT tokens are generated and validated securely.

---

## 1.2 User Input Validation

Test files:

```text
src/auth/dto/register.dto.spec.ts
src/auth/dto/login.dto.spec.ts
```

Covered cases:

```text
✓ Required fields validation
✓ Email format validation
✓ Password validation rules
✓ Missing fields handling
✓ Invalid payload rejection
✓ Valid payload acceptance
```

Run test:

```bash

# Register DTO
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/dto/register.dto.spec.ts"

# Login DTO
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/dto/login.dto.spec.ts"
```


These tests prevent invalid or malformed input from reaching the application business logic.

---

## 1.3 Product Data Model and Query Validation

Test file:

```text
src/modules/products/dto/products.querries.spec.ts
```

Covered cases:

```text
✓ Product query validation
✓ Required product fields
✓ Price and numeric validation
✓ Enum validation
✓ Pagination parameters validation
✓ Filtering parameters validation
✓ Sorting parameters validation
✓ Query parameter transformation
✓ Array transformation for filters
✓ Numeric transformation from query strings
```
Run test:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/modules/products/dto/products.querries.spec.ts"
```

These tests verify that product filtering, sorting, and pagination parameters are correctly validated and transformed.

---

## 1.4 Cart Functionality

Covered cases:

```text
✓ Create cart automatically
✓ Add new product to cart
✓ Increase existing quantity
✓ Validate stock quantity
✓ Reject inactive products
✓ Reject out-of-stock products
✓ Reject invalid SKU IDs
✓ Return empty cart safely
✓ Calculate subtotal correctly
✓ Generate warnings
✓ Handle unavailable products
✓ Adjust quantities automatically
✓ Update quantity successfully
✓ Reject quantity above stock
✓ Remove item when quantity becomes zero
✓ Reject invalid cart item
✓ Remove cart item successfully
✓ Clear all cart items
```

These tests verify that cart item management, stock validation, warnings, and subtotal calculations work correctly.

Example tested logic:

```ts
if (dto.quantity > sku.stockQty) {
  throw new BadRequestException(
    'Requested quantity exceeds stock',
  )
}
```

Example subtotal calculation:

```ts
const subtotalCents = items.reduce(
  (sum, item) => sum + item.lineTotalCents,
  0,
)
```

---

## 1.5 Order Summary Calculations

Test file:

```text
src/orders/order-summary.spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "npm run test -- order-summary.spec.ts"
```

Covered cases:

```text
✓ Calculate subtotal correctly
✓ Apply shipping cost
✓ Calculate final total
✓ Generate order item snapshots
✓ Reject invalid SKUs
✓ Reject insufficient stock
✓ Validate stock before order creation
✓ Reserve stock inside transaction
✓ Prevent overselling
✓ Rollback failed reservations
✓ Encrypt customer information
✓ Encrypt shipping address
✓ Decrypt safely before API response
```

These tests verify pricing, shipping, stock reservation, and encryption behavior during order creation.

Example tested calculation:

```ts
const totalCents = subtotalCents + shippingCents
```

Example stock reservation logic:

```ts
await tx.productSku.updateMany({
  where: {
    id: item.skuId,
    stockQty: {
      gte: item.quantity,
    },
  },
})
```

---

# 2. API Integration Tests

Integration tests validate real HTTP requests through the NestJS application.

---

## 2.1 Authentication E2E Tests

Test files:

```text
test/auth.e2e-spec.ts
test/auth-registration.e2e-spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "npm run test:e2e -- auth-registration.e2e-spec.ts"

docker compose exec backend sh -c "npm run test:e2e -- auth.e2e-spec.ts"
```

Covered cases:

```text
✓ POST /auth/register creates a new user
✓ POST /auth/register rejects mismatched passwords
✓ POST /auth/login authenticates a valid user
✓ POST /auth/login rejects invalid credentials
✓ POST /auth/refresh returns a new access token when refresh cookie is present
✓ POST /auth/logout revokes the current session
✓ Password hashing
✓ Duplicate email rejection
✓ DTO validation
✓ CAPTCHA validation
✓ Sensitive field protection
```

These tests verify the authentication flow, request validation, refresh token cookie handling, and integration with the database layer.

For test stability:

```text
✓ CAPTCHA verification is mocked
✓ Unique test emails are used
✓ Cookie parsing is enabled in the test application setup
```

---

## 2.2 Checkout E2E Tests

Test file:

```text
test/checkout.e2e-spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "npm run test:e2e -- checkout.e2e-spec.ts"
```

Covered cases:

```text
✓ Guest checkout
✓ Logged-in checkout
✓ Order creation
✓ Shipping calculation
✓ Final total calculation
✓ Stock reservation
✓ Guest token generation
✓ Invalid checkout rejection
```

These tests verify the critical checkout flow from cart/order creation to stock reservation.

---

## 2.3 Products API E2E Tests

Test file:

```text
test/products.e2e-spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test:e2e -- test/products.e2e-spec.ts"
```

Covered cases:

```text
✓ GET /products returns a paginated product list
✓ Pagination parameters (page, pageSize) are accepted
✓ Invalid pagination parameters are rejected
✓ Product search query parameter is accepted
✓ Unsupported query parameters are rejected
```

Verified response structure:

```text
✓ items
✓ page
✓ pageSize
✓ total
```

Example tested requests:

```http
GET /products
```

```http
GET /products?page=1&pageSize=10
```

```http
GET /products?query=test
```

```http
GET /products?page=abc&pageSize=xyz
```

Expected behavior:

```text
✓ Valid requests return HTTP 200
✓ Invalid query parameters return HTTP 400
✓ Product listing data is returned in the expected format
✓ Search requests are processed successfully
```

These tests verify that the Products API correctly handles pagination, searching, validation, and response formatting while retrieving data from the database.

---

## 2.4 Orders API E2E Tests

Test file:

```text
test/orders.e2e-spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test:e2e -- test/orders.e2e-spec.ts"
```

Covered cases:

```text
✓ Order creation rejects empty payloads
✓ Order creation rejects unexpected fields
✓ Protected order endpoints require authentication
✓ Unauthenticated users cannot access their orders
✓ Unauthenticated users cannot access individual order details
✓ Unauthenticated users cannot cancel orders
✓ Invalid order IDs are handled correctly
✓ Invalid guest tokens are handled correctly
```

Example tested requests:

```http
POST /orders
```

```http
GET /orders/me
```

```http
GET /orders/me/:id
```

```http
PATCH /orders/me/:orderId/cancel
```

```http
GET /orders/:id
```

Expected behavior:

```text
✓ Invalid requests return HTTP 400
✓ Unauthorized requests return HTTP 401
✓ Invalid resources return appropriate error responses
✓ Protected endpoints cannot be accessed without authentication
✓ Public order lookup validates guest access correctly
```

These tests verify that the Orders API correctly enforces authentication requirements, validates incoming requests, and handles invalid order access attempts securely.

---

# 3. Database Operations Coverage

The application uses PostgreSQL with Prisma ORM. Database operations are verified through integration and end-to-end tests that execute real HTTP requests and business logic against the database layer.

The objective of these tests is to ensure that data is correctly stored, retrieved, updated, and protected throughout the application.

---

## Authentication Database Operations

Covered by:

```text
test/auth.e2e-spec.ts
test/auth-registration.e2e-spec.ts
src/auth/auth.service.spec.ts
```

Verified database operations:

```text
✓ User creation
✓ Duplicate email detection
✓ User retrieval by email
✓ Password hash storage
✓ Session creation
✓ Session revocation
✓ Refresh token persistence
✓ Refresh token rotation
✓ Password reset token storage
✓ Password reset token validation
✓ OAuth account lookup
✓ Two-factor authentication data storage
```

These tests verify that authentication-related data is correctly persisted and retrieved from the database.

---

## Products Database Operations

Covered by:

```text
test/products.e2e-spec.ts
```

Verified database operations:

```text
✓ Product retrieval
✓ Product count retrieval
✓ Product pagination queries
✓ Product search queries
✓ Product filtering validation
✓ Product sorting validation
```

These tests verify that products can be retrieved correctly and that search and filtering operations interact properly with the database.

---

## Cart Database Operations

Covered by:

```text
Cart service unit tests
```

Verified database operations:

```text
✓ Cart creation
✓ Cart item insertion
✓ Cart item updates
✓ Cart item removal
✓ Cart clearing
✓ Stock validation before updates
```

These tests verify that cart-related data is managed correctly before checkout.

---

## Order Database Operations

Covered by:

```text
test/orders.e2e-spec.ts
test/checkout.e2e-spec.ts
src/orders/order-summary.spec.ts
```

Verified database operations:

```text
✓ Order creation
✓ Order retrieval
✓ User-order relationships
✓ Guest order access
✓ Order ownership validation
✓ Order cancellation authorization
✓ Order item snapshot creation
✓ Shipping information persistence
✓ Customer information persistence
```

These tests verify that order data is correctly stored and retrieved while enforcing proper access control.

---

## Inventory Database Operations

Covered by:

```text
src/orders/order-summary.spec.ts
test/checkout.e2e-spec.ts
```

Verified database operations:

```text
✓ Stock validation
✓ Stock reservation
✓ Prevention of overselling
✓ Transaction rollback handling
✓ Stock restoration during cancellation/refund flows
```

These tests verify that inventory remains consistent throughout the checkout lifecycle.

---

## Security-Related Database Operations

Covered by:

```text
src/auth/auth.service.spec.ts
test/auth.security.e2e-spec.ts
test/auth-rate-limit.e2e-spec.ts
```

Verified database operations:

```text
✓ Session validation
✓ Refresh token validation
✓ Refresh token revocation
✓ Password reset token lookup
✓ Authentication failure handling
✓ Rate limiting protection
```

These tests help ensure that authentication and authorization data remains secure.

---

## Conclusion

The automated test suite verifies the most critical database operations used by the application:

```text
✓ User creation and retrieval
✓ Authentication and session persistence
✓ Product retrieval and search
✓ Cart management
✓ Order creation and retrieval
✓ Inventory reservation and validation
✓ Secure access control
✓ Transaction handling
✓ Data persistence through Prisma and PostgreSQL
```

Together, these tests provide confidence that the application correctly stores, retrieves, updates, and protects data while supporting core e-commerce workflows.
---

# 4. Product Search Flow Tests

Test file:

```text
test/search.e2e-spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test:e2e -- test/search.e2e-spec.ts"
```

Covered cases:

```text
✓ Empty query returns empty suggestions
✓ Query shorter than 2 characters returns empty suggestions
✓ Valid query returns a suggestions array
✓ Suggestions contain valid structure
✓ Suggestions are grouped by type: brand, category, product
✓ Duplicate suggestions are removed
```

These tests verify that the search suggestion endpoint behaves correctly and returns safe, structured, and relevant search data.

Status:

```text
✓ Product search suggestion flow is covered
✓ Search response structure is verified
✓ Duplicate prevention is verified
```

# 5. Security Tests

Security tests verify authentication logic, token handling, session management, input validation, and protection against common abuse scenarios.

---

## 5.1 Authentication Service Security Tests

Test file:

```text
src/auth/auth.service.spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test -- src/auth/auth.service.spec.ts"
```

Covered cases:

```text
✓ Password hashing and password comparison
✓ User registration validation
✓ Login credential validation
✓ Handling OAuth-only accounts
✓ 2FA login flow returning temporary token
✓ Refresh token validation
✓ Refresh token rotation
✓ Refresh token reuse detection and session revocation
✓ Session creation and session revocation
✓ Password reset token validation
✓ Password reset invalid/expired token handling
✓ Account setup password update validation
```

These tests verify that authentication and session security rules are correctly enforced.

---

## 5.2 Input Validation Security Tests

Test file:

```text
test/auth.security.e2e-spec.ts
```
Run command:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test:e2e -- test/auth.security.e2e-spec.ts"
```

Covered cases:

```text
✓ Rejection of malformed authentication payloads
✓ Rejection of invalid email formats
✓ Rejection of missing required fields
✓ Rejection of unexpected fields
✓ Rejection of malformed payload types
✓ Rejection of requests without required refresh cookies
✓ Proper handling of invalid refresh tokens
✓ No leakage of sensitive authentication details in error responses
✓ CAPTCHA failure handling
✓ Protection against invalid authentication payloads
✓ Brute-force mitigation through rate limiting
```

These tests verify that authentication endpoints reject unsafe or invalid requests.

---

## 5.3 Rate Limiting Security Tests

Test file:

```text
test/auth-rate-limit.e2e-spec.ts
```

Run command:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run test:e2e -- test/auth-rate-limit.e2e-spec.ts"
```

Covered cases:

```text
✓ Multiple failed login attempts from the same client
✓ Token bucket consumption on repeated requests
✓ Request throttling after bucket exhaustion
✓ API returns HTTP 429 Too Many Requests
✓ Protection against brute-force login attempts
✓ Protection against excessive authentication requests
```

Example tested scenario:

```text
1. Register a test user
2. Send repeated login requests with an invalid password
3. Continue requests until the token bucket is exhausted
4. Verify that the API returns HTTP 429
```

Expected behavior:

```text
✓ Initial requests are processed normally
✓ Excessive requests are blocked
✓ HTTP 429 Too Many Requests is returned
```

These tests verify that the Token Bucket rate limiting mechanism is functioning correctly and helps protect authentication endpoints against abuse and brute-force attacks.

---

