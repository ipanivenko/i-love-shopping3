# 💳 Payment Integration

## 📌 Overview

The MoveOn platform uses Stripe to handle secure online payment processing.

The payment system supports:
- Secure card payments
- PaymentIntent workflow
- Payment status tracking
- Failed payment handling
- Refund processing
- Webhook-based payment synchronization
- Payment expiration handling

Sensitive card data is never stored directly in the application database.

---

# 🛡️ Secure Payment Processing

The frontend integrates Stripe Elements to securely collect payment information.

Card information is sent directly to Stripe and does not pass through or get stored by the backend application.

This approach improves:
- Security
- PCI compliance
- Payment reliability

---

# 💳 Payment Flow

The payment process follows this general workflow:

```text
Checkout
    |
    v
Create Order
    |
    v
Create Stripe PaymentIntent
    |
    v
Frontend Payment Form
    |
    v
Stripe Payment Processing
    |
    v
Stripe Webhook Event
    |
    v
RabbitMQ Queue
    |
    v
Payment Consumer
    |
    v
Order & Payment Status Update
    |
    v
Confirmation email


```

---

# 🧾 PaymentIntent Workflow

After the order is created:
1. The backend creates a Stripe PaymentIntent
2. Stripe returns a client secret
3. The frontend initializes Stripe Elements
4. The user submits card information
5. Stripe processes the payment
6. Stripe sends webhook events to the backend
7. The backend updates payment and order statuses

---

# 📨 Webhook Handling

Stripe webhooks are used to synchronize payment results with the backend application.

Webhook events handled include:
- Successful payments
- Failed payments
- Payment status updates

Webhook processing ensures that the backend receives reliable payment confirmation directly from Stripe.

---

# 🔄 RabbitMQ Payment Processing

Webhook events are forwarded into RabbitMQ queues for asynchronous processing.

RabbitMQ is used to:
- Decouple webhook handling from business logic
- Improve reliability
- Prevent blocking webhook responses
- Process payment events safely in the background

Example asynchronous operations:
- Mark order as paid
- Mark payment as failed
- Trigger refund workflows
- Update order statuses

---

# ⏳ Payment Expiration

Orders waiting for payment can expire automatically after a configured period.

If payment is not completed before expiration:
- The order status becomes `PAYMENT_EXPIRED`
- Reserved stock is restored
- The payment transaction is marked as expired

This prevents inventory from remaining blocked indefinitely.

---

# 💸 Refund Support

The payment system supports refund workflows.

Refund functionality includes:
- Refund transaction records
- Parent payment references
- Refund status tracking
- Order status updates

Refund transactions remain linked to the original payment transaction for traceability.

---

# 🧮 Payment Transactions

The system stores payment transaction data including:
- Payment provider
- Payment type
- Transaction status
- Amount
- Currency
- Stripe payment identifiers
- Charge identifiers
- Receipt URL
- Card brand
- Last four card digits

This information is used for:
- Order tracking
- Refund processing
- Payment auditing
- Customer support

---

# 🧪 Stripe Test Cards

The following Stripe test cards can be used during development:

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Simulated payment failure |

Any future expiration date and any 3-digit CVC can be used in test mode.

---

# 🔐 Payment Security

The payment system includes:
- Stripe-hosted card handling
- Webhook signature verification
- Secure PaymentIntent workflow
- Backend payment validation
- Environment-based API secrets
- Separation of order and payment statuses

Sensitive secrets are stored using environment variables.

---

# 🔄 Payment Architecture

```text
Frontend Payment UI
        |
        v
Stripe Elements
        |
        v
Backend Payment API
        |
        +-------> Stripe API
        |
        +-------> Stripe Webhooks
                          |
                          v
                     RabbitMQ
                          |
                          v
                  Payment Consumers
                          |
                          v
                   PostgreSQL
```

---

# 🔌 Main Payment Endpoints

| Endpoint | Description |
|---|---|
| `POST /orders/:id/payment-intent` | Create Stripe PaymentIntent |
| `POST /payments/webhook` | Receive Stripe webhook events |
| `POST /payments/orders/:id/expire` | Expire unpaid order |

---

# ✅ Payment System Goals

The payment system was designed to provide:
- Secure online payments
- Reliable payment synchronization
- Asynchronous event processing
- Safe order lifecycle handling
- Refund support
- Payment failure recovery
- Scalable payment architecture

---