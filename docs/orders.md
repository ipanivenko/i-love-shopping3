# 📦 Order Management

## 📌 Overview

The MoveOn platform includes a complete order management system responsible for handling the lifecycle of customer orders from creation to payment, shipping, cancellation, and refunds.

The order system supports:
- Guest orders
- Authenticated user orders
- Order snapshots
- Payment tracking
- Shipping tracking
- Order status history
- Cancellation requests
- Refund workflows
- Payment expiration handling

The system was designed to preserve order consistency even when products or customer information later change in the database.

---

# 🛒 Order Creation

Orders are created after the checkout flow is completed.

During order creation, the system:
1. Validates the cart
2. Validates stock availability
3. Creates the order
4. Creates order items
5. Stores shipping information snapshots
6. Stores customer information snapshots
7. Creates payment transaction records
8. Initializes payment processing

---

# 👤 Guest & Authenticated Orders

The platform supports both:
- Guest orders
- Authenticated user orders

Authenticated users:
- Have access to order history
- Can retrieve previous orders
- Benefit from prefilled checkout information

Guest users:
- Can place orders without registration
- Receive a guest token linked to the order
- Can complete payment without creating an account

---

# 📸 Order Snapshots

The order system stores product and shipping information as snapshots.

Snapshots include:
- Product name
- Product image
- Product brand
- SKU label
- Unit price
- Shipping information
- Customer information

This ensures that old orders remain historically accurate even if:
- Product names change
- Prices change
- Products are deleted
- Shipping methods are updated

---

# 🧾 Order Structure

Main order entities:

```text
Order
 ├── OrderItem
 ├── OrderCustomerInfo
 ├── OrderShippingAddress
 ├── OrderShippingMethod
 ├── PaymentTransaction
 └── OrderStatusHistory
```

---

# 🔄 Order Status Lifecycle

Orders can move through several statuses during their lifecycle.

```text
PENDING_PAYMENT
PAYMENT_FAILED
PAYMENT_SUCCESSFUL
PAYMENT_EXPIRED
PROCESSING
SHIPPED
DELIVERED
CANCEL_REQUESTED
CANCELLED
PARTIALLY_REFUNDED
REFUNDED
```

---

# 📚 Order Status History

Every important order status change is stored in `OrderStatusHistory`.

The history system allows:
- Order timeline tracking
- Auditability
- Debugging
- Customer support visibility

Each history record can contain:
- Status
- Optional note
- Creation timestamp

---

# 💳 Payment Integration

Orders are tightly connected to the payment system.

Each order can contain multiple payment transactions:
- Initial payment
- Refund transactions
- Partial refunds

The order system synchronizes with Stripe webhook events through RabbitMQ consumers.

---

# ⏳ Payment Expiration

Orders waiting for payment are temporary.

If payment is not completed before the expiration time:
- The order status becomes `PAYMENT_EXPIRED`
- Reserved stock is restored
- Payment transactions are updated

This prevents inventory from remaining locked indefinitely.

---

# 📦 Stock Reservation & Restore

When an order is created:
- Product stock is reduced immediately

If payment fails or expires:
- Stock can be restored automatically

This helps:
- Prevent overselling
- Protect inventory consistency
- Keep checkout reliable

---

# 🚫 Order Cancellation

Authenticated users can access their orders from the frontend by pressing the orders icon in the application header.

Orders can only be cancelled if they have not yet entered the processing stage.

Orders already marked as:
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`

can no longer be cancelled by the customer.

---

## Cancellation Flow

```text
Customer
    |
    v
Cancel Order Request
    |
    v
Order status -> CANCEL_REQUESTED
    |
    v
RabbitMQ Event Published
    |
    v
Cancellation Consumer
    |
    v
Refund Processing
    |
    v
Order status -> CANCELLED
```

---

## Cancellation Processing

The cancellation workflow can include:
- Order status updates
- Refund processing
- Payment transaction updates
- Email notifications
- Stock restoration when applicable

The asynchronous workflow helps keep the API responsive while processing cancellation logic safely in the background.

---

# 💸 Refund Handling

If an order was already paid before cancellation, the system can automatically initiate a refund workflow.

Refund handling includes:
- Refund transaction records
- Stripe refund requests
- Payment status updates
- Order status updates
- Refund confirmation emails

Refund transactions remain linked to the original payment transaction for traceability and payment history consistency.

---

# 📧 Order Emails

Transactional emails can be sent for:
- Successful payment
- Failed payment
- Refund confirmation
- Cancellation updates
- Payment expiration

Email sending can be triggered asynchronously through RabbitMQ consumers.

---

# 🔄 Order Architecture

```text
Checkout
    |
    v
Create Order
    |
    v
Reserve Stock
    |
    v
Create Payment Transaction
    |
    v
Stripe Payment
    |
    v
Stripe Webhook
    |
    v
RabbitMQ Consumer
    |
    v
Order Status Update
    |
    v
Email Notification
```

---

# 🔌 Main Order Endpoints

| Endpoint | Description |
|---|---|
| `POST /orders` | Create new order |
| `GET /orders/me` | Retrieve authenticated user orders |
| `GET /orders/me/:id` | Retrieve specific user order |
| `POST /orders/:id/cancel` | Request order cancellation |

---

# 🛡️ Order Management Protections

The order system includes:
- Stock validation
- Quantity validation
- Payment synchronization
- Expiration handling
- Snapshot storage
- Status history tracking
- Refund tracking
- Secure guest order handling

These protections help maintain order consistency and payment reliability.

---

# ✅ Order Management Goals

The order system was designed to provide:
- Reliable order lifecycle tracking
- Secure checkout handling
- Consistent payment synchronization
- Scalable refund workflows
- Historical order accuracy
- Guest and authenticated order support
- Reliable inventory handling

---