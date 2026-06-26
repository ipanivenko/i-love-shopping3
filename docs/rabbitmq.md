# 📨 RabbitMQ Architecture

## 📌 Overview

The MoveOn platform uses RabbitMQ for asynchronous background processing.

RabbitMQ helps separate immediate API responses from longer business operations such as:
- Updating orders after payment events
- Handling failed payments
- Expiring unpaid orders
- Processing cancellation requests
- Processing refunds
- Sending transactional emails

This makes the application more reliable because important background tasks can be processed separately from the main HTTP request flow.

---

# 🎯 Why RabbitMQ Is Used

RabbitMQ is used to:
- Decouple services
- Process payment events asynchronously
- Avoid blocking webhook responses
- Improve reliability of order updates
- Handle background jobs
- Keep business workflows easier to maintain

Instead of doing every operation directly inside a controller or webhook handler, the application publishes a message to a queue and lets a consumer process it.

---

# 🧱 General RabbitMQ Flow

```text
Producer
   |
   v
RabbitMQ Queue
   |
   v
Consumer
   |
   v
Business Logic
   |
   v
Database Update / Email Sending
```

---

# 🧩 Main RabbitMQ Actors

| Actor | Role |
|---|---|
| Producer | Publishes messages to RabbitMQ |
| Queue | Stores messages until they are consumed |
| Consumer | Listens to a queue and processes messages |
| Service | Executes business logic after message consumption |

---

# 🔄 When RabbitMQ Is Used

RabbitMQ is used in several key business flows:

| Flow | Purpose |
|---|---|
| Payment succeeded | Mark order as paid and send confirmation email |
| Payment failed | Mark order/payment as failed |
| Order payment expired | Expire unpaid order and restore stock |
| Cancellation requested | Start cancellation and refund workflow |
| Refund requested | Process refund asynchronously |
| Email sending | Send order/payment/cancellation emails in the background |

---

# 💳 Payment Successful Flow

When Stripe confirms a successful payment, the backend does not directly execute all business logic inside the webhook handler.

Instead, the webhook publishes a message to RabbitMQ.

```text
Stripe
  |
  v
Backend Webhook
  |
  v
payment-succeeded-queue
  |
  v
PaymentSucceededConsumer
  |
  v
OrdersService.markOrderAsPaid()
  |
  v
Database Update
  |
  v
Email Notification
```

Result:
- Payment transaction is marked as `SUCCEEDED`
- Order status is updated to `PAYMENT_SUCCESSFUL`
- Stock reservation is confirmed
- Payment confirmation email is sent to the customer

---

# ❌ Payment Failed Flow

When Stripe reports a failed payment, the webhook publishes a failure event.

```text
Stripe
  |
  v
Backend Webhook
  |
  v
payment-failed-queue
  |
  v
PaymentFailedConsumer
  |
  v
OrdersService.markOrderAsPaymentFailed()
  |
  v
Database Update
```

Result:
- Payment transaction is marked as `FAILED`
- Order status is updated to `PAYMENT_FAILED`
- Error information can be stored for debugging and customer support

---

# ⏳ Order Payment Expiration Flow

When an order is created, it is not paid immediately. The system gives the customer a limited time to complete the payment.

A scheduled job checks for expired unpaid orders and publishes expiration messages.

```text
Cron Job
  |
  v
Find expired PENDING_PAYMENT orders
  |
  v
order-payment-expired-queue
  |
  v
OrderPaymentExpiredConsumer
  |
  v
OrdersService.expirePendingPaymentOrder()
  |
  v
Database Update + Stock Restore
```

Result:
- Order status becomes `PAYMENT_EXPIRED`
- Payment transaction becomes `EXPIRED`
- Reserved stock is restored
- Customer can no longer complete payment for the expired order

---

# 🚫 Order Cancellation Flow

When a customer requests order cancellation, the order is first marked as cancellation requested.

RabbitMQ is then used to continue the refund/cancellation workflow asynchronously.

```text
Customer
  |
  v
Cancel Order Button
  |
  v
Orders API
  |
  v
Order status: CANCEL_REQUESTED
  |
  v
order-cancellation-requested-queue
  |
  v
OrderCancellationRequestedConsumer
  |
  v
PaymentsService
  |
  v
Refund Request
```

Result:
- Order status becomes `CANCEL_REQUESTED`
- Refund workflow is started if payment was already completed
- Cancellation logic is processed in the background

---

# 💸 Refund Requested Flow

Refund processing is handled asynchronously through RabbitMQ.

```text
Refund Request
  |
  v
order-refund-requested-queue
  |
  v
OrderRefundRequestedConsumer
  |
  v
PaymentsService.refundOrderPayment()
  |
  v
Stripe Refund API
  |
  v
PaymentTransaction REFUND record
  |
  v
Order status update
  |
  v
Email Notification
```

Result:
- Refund is requested from Stripe
- Refund transaction is stored in the database
- Order is marked as `REFUNDED` or `PARTIALLY_REFUNDED`
- Refund confirmation email can be sent to the customer

---

# 📧 Email Sending

Transactional emails can be triggered after important order and payment events.

Examples:
- Order paid confirmation
- Payment failed notification
- Order cancellation request confirmation
- Refund confirmation
- Payment expiration notification

Email sending can be handled as part of the consumer workflow so the main request remains fast and the user does not wait for email delivery.

```text
Business Event
  |
  v
RabbitMQ Consumer
  |
  v
Email Service
  |
  v
Customer Email
```

---

# 🧾 Queue Summary

| Queue | Producer | Consumer | Purpose |
|---|---|---|---|
| `payment-succeeded-queue` | Stripe webhook | PaymentSucceededConsumer | Mark order as paid and send confirmation email |
| `payment-failed-queue` | Stripe webhook | PaymentFailedConsumer | Mark payment and order as failed |
| `order-payment-expired-queue` | Cron job | OrderPaymentExpiredConsumer | Expire unpaid order and restore stock |
| `order-cancellation-requested-queue` | Orders API | OrderCancellationRequestedConsumer | Start cancellation workflow |
| `order-refund-requested-queue` | Cancellation/refund logic | OrderRefundRequestedConsumer | Process refund through Stripe |

---

# 🛡️ Reliability Benefits

RabbitMQ improves reliability because:
- Messages are processed outside the request-response cycle
- Webhook handlers can respond quickly
- Background jobs can be retried more safely
- Payment and order logic is separated
- Consumers can focus on one responsibility
- Email sending does not block user actions

---

# ✅ RabbitMQ Architecture Goals

The RabbitMQ architecture was designed to provide:
- Asynchronous processing
- Reliable payment handling
- Cleaner service separation
- Background order lifecycle management
- Scalable refund and cancellation workflows
- Transactional email support

---