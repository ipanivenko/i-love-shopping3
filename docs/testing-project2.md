# 🧪 Project 2 Testing

## 📌 Overview

The MoveOn platform includes:
- Unit tests
- Integration tests
- End-to-End (E2E) tests
- Manual security verification

---

# 🐳 Prepare the Environment

Before running tests, make sure the Docker containers are running from the project root:

```bash
docker compose up
```

If the containers were not built yet:

```bash
docker compose up --build
```

---

# 🧪 Running Tests

Since the backend application runs inside Docker, tests must be executed from the backend container.

General command format:

```bash
docker compose exec backend sh -c "<TEST_COMMAND>"
```

---

# 🛒 Cart Service Unit Tests

## Test File

```text
src/cart/cart.service.spec.ts
```

---

## Run Tests

```bash
docker compose exec backend sh -c "npm run test -- cart.service.spec.ts"
```

---

## Tested Features

### Add Item To Cart

Covered cases:

```text
✓ Create cart automatically
✓ Add new product to cart
✓ Increase existing quantity
✓ Validate stock quantity
✓ Reject inactive products
✓ Reject out-of-stock products
✓ Reject invalid SKU IDs
```

Example tested logic:

```ts
if (dto.quantity > sku.stockQty) {
  throw new BadRequestException(
    'Requested quantity exceeds stock',
  )
}
```

---

### Get Cart

Covered cases:

```text
✓ Return empty cart safely
✓ Calculate subtotal correctly
✓ Generate warnings
✓ Handle unavailable products
✓ Adjust quantities automatically
```

Example subtotal calculation:

```ts
const subtotalCents = items.reduce(
  (sum, item) => sum + item.lineTotalCents,
  0,
)
```

Example warning generation:

```ts
warnings.push({
  skuId: item.skuId,
  reason: 'OUT_OF_STOCK',
})
```

---

### Update Cart Quantity

Covered cases:

```text
✓ Update quantity successfully
✓ Reject quantity above stock
✓ Remove item when quantity becomes zero
✓ Reject invalid cart item
```

---

### Remove Cart Item

Covered cases:

```text
✓ Remove item successfully
✓ Reject invalid cart
✓ Reject invalid item
```

---

### Clear Cart

Covered cases:

```text
✓ Remove all cart items
✓ Return valid empty response
✓ Clean cart safely
```

---

# 📦 Order Summary Unit Tests

## Test File

```text
src/orders/order-summary.spec.ts
```

---

## Run Tests

```bash
docker compose exec backend sh -c "npm run test -- order-summary.spec.ts"
```

---

## Tested Features

### Order Calculations

Covered cases:

```text
✓ Calculate subtotal correctly
✓ Apply shipping cost
✓ Calculate final total
✓ Generate order item snapshots
```

Example tested calculation:

```ts
const totalCents = subtotalCents + shippingCents
```

---

### Stock Validation

Covered cases:

```text
✓ Reject invalid SKUs
✓ Reject insufficient stock
✓ Validate stock before order creation
```

---

### Stock Reservation

Covered cases:

```text
✓ Reserve stock inside transaction
✓ Prevent overselling
✓ Rollback failed reservations
```

Example tested logic:

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

### Encryption Validation

Covered cases:

```text
✓ Encrypt customer information
✓ Encrypt shipping address
✓ Decrypt safely before API response
```

---

# 🔐 Authentication E2E Tests

## Test File

```text
test/auth-registration.e2e-spec.ts
```

---

## Run Tests

```bash
docker compose exec backend sh -c "npm run test:e2e -- auth-registration.e2e-spec.ts"
```

---

## Covered Cases

```text
✓ User registration
✓ Password hashing
✓ Duplicate email rejection
✓ DTO validation
✓ Captcha validation
✓ Sensitive field protection
```

---

# 🛒 Checkout E2E Tests

## Test File

```text
test/checkout.e2e-spec.ts
```

---

## Run Tests

```bash
docker compose exec backend sh -c "npm run test:e2e -- checkout.e2e-spec.ts"
```

---

## Covered Cases

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

---

# 💳 Payment Flow Testing

## Stripe Test Cards

The following Stripe cards are used during development testing:

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Simulated payment failure |

Any future expiration date and any 3-digit CVC can be used.

---

## Stripe Webhook Testing

Before testing payment flows locally, start the Stripe webhook listener:

```bash
stripe listen --forward-to http://127.0.0.1:3000/payments/webhook
```

This allows Stripe webhook events to reach the local backend application.

---

# 📨 RabbitMQ Flow Testing

RabbitMQ workflows are tested through:
- Payment success events
- Payment failure events
- Order expiration events
- Cancellation requests
- Refund workflows

Expected behaviors:

```text
✓ Order status updates correctly
✓ Payment transaction updates correctly
✓ Stock restoration works
✓ RabbitMQ consumers process messages
✓ Emails are triggered correctly
```

---

# 🔒 Manual Encryption Testing

Sensitive customer data is encrypted before database storage.

Encrypted fields include:

```text
- Customer email
- Customer name
- Shipping address
- Phone number
- City
```

---

## Manual Verification Steps

### 1. Create a test order

Create an order through the checkout flow.

---

### 2. Inspect database values

Example queries:

```sql
SELECT * FROM "OrderCustomerInfo";
```

```sql
SELECT * FROM "OrderShippingAddress";
```

---

### 3. Verify encrypted storage

Expected behavior:

```text
✓ Sensitive values are not stored as readable text
✓ Encrypted values appear unreadable in PostgreSQL
```

Example encrypted value:

```text
3f7a9c21d8abf5...
```

Incorrect example:

```text
john@test.com
```

---

### 4. Verify successful decryption

Retrieve the order through the API.

Expected behavior:

```text
✓ Backend decrypts values correctly before API response
✓ Customer receives readable information
```

---

# 🌐 HTTPS & Data In Transit

In production, HTTPS should be enabled to protect data transmitted between client and server.

Expected behavior:

```text
✓ HTTPS enabled
✓ Authentication tokens protected
✓ Sensitive customer information encrypted during transit
```

---

# 🧾 Mocking Strategy

Unit tests use mocked services instead of real infrastructure.

Mocked services include:
- PrismaService
- EncryptionService
- RabbitmqService
- CaptchaService

Benefits:

```text
✓ Faster execution
✓ Isolated business logic testing
✓ No PostgreSQL dependency
✓ No RabbitMQ dependency
✓ Easier debugging
```

---

# ✅ Testing Goals

The testing strategy was designed to help ensure:
- Reliable checkout behavior
- Correct pricing calculations
- Safe stock reservation
- Secure authentication flows
- Correct payment synchronization
- Reliable RabbitMQ processing
- Safe encryption handling
- Stable e-commerce workflows

---