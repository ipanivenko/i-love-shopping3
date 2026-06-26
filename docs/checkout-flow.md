# 📦 Checkout Flow

## 📌 Overview

The MoveOn platform includes a multi-step checkout workflow designed for both guest users and authenticated users.

The checkout system handles:
- Customer information
- Shipping address collection
- Address validation
- Shipping method selection
- Order creation
- Payment initialization
- Secure checkout flows

The checkout process was designed to provide a smooth and reliable purchasing experience while validating stock, customer data, and shipping information before payment.

---

# 👤 User Profile Prefill

Authenticated users can manage their checkout information directly from the user profile section accessible through the header user button.

Users can save:
- Full name
- Phone number
- Address
- City
- Postal code
- Country

When the user starts the checkout process, this information is automatically prefilled into the checkout form.

This reduces repetitive form entry and improves checkout usability for returning customers.

---

# 🛒 Guest & Authenticated Checkout

The checkout system supports:
- Guest checkout
- Authenticated checkout

Guest users can place orders without creating an account.

Authenticated users benefit from:
- Saved customer information
- Faster checkout experience
- Order history access
- Persistent cart synchronization

---

# 🧾 Checkout Steps

The checkout flow is divided into several sections:

```text
1. Contact Information
2. Delivery Address
3. Shipping Method
4. Payment Method
5. Order Summary
```

Each step validates user input before allowing the order process to continue.

---

# 📍 Address Validation

The platform validates shipping addresses using the Nominatim geocoding service based on OpenStreetMap data.

The validation process attempts to verify:
- Address existence
- City
- Postal code
- Country consistency

Address validation helps reduce:
- Invalid delivery addresses
- Shipping errors
- Incomplete customer information

---

## Validation Fallback

If automatic validation cannot confidently verify the address, the user can still continue manually by confirming that the entered address is correct.

This prevents valid addresses from being blocked while still encouraging address verification.

---

# 🚚 Shipping Methods

The checkout system supports selectable shipping methods.

Each shipping method contains:
- Name
- Code
- Price
- Currency
- Estimated delivery time

Example:

```text
ECONOMY
STANDARD
EXPRESS
```

Shipping costs are included in the final order total calculation.

---

# 📦 Order Creation

After checkout validation:
1. Stock is validated again
2. The order is created
3. Order items are stored as snapshots
4. Shipping information is stored
5. Payment initialization begins

Order snapshots preserve the original purchase information even if products later change in the catalog.

---

# 🧮 Order Price Calculation

The system calculates:
- Product subtotal
- Shipping cost
- Final total amount

Example:

```text
Subtotal + Shipping = Total
```

Prices are stored using integer minor currency units (cents) to avoid floating-point precision issues.

---

# 🛡️ Checkout Protections

The checkout flow includes several protections:
- Stock validation
- Quantity validation
- Product availability validation
- Address validation
- Payment expiration handling
- Secure payment processing

These protections help reduce invalid orders and improve payment reliability.

---

# 🔄 Checkout Architecture

```text
Frontend Checkout UI
        |
        v
Checkout API
        |
        v
Order Service
        |
        +-------> Address Validation (Nominatim)
        |
        +-------> PostgreSQL
        |
        +-------> Stripe Payment Initialization
```

---

# 🔌 Main Checkout Endpoints

| Endpoint | Description |
|---|---|
| `GET /checkout/prefill` | Retrieve saved user checkout information |
| `PATCH /checkout/profile` | Update saved user checkout information |
| `POST /checkout/validate-address` | Validate shipping address |
| `POST /orders` | Create order from checkout |
| `POST /orders/:id/payment-intent` | Create Stripe payment intent |

---

# ✅ Checkout Flow Goals

The checkout system was designed to provide:
- Smooth user experience
- Fast checkout flow
- Guest checkout support
- Reliable stock validation
- Safe order creation
- Accurate shipping information
- Secure payment preparation

---