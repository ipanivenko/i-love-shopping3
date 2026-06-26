# 🟢 MoveOn – B2C E-Commerce Platform

## 📌 Overview

MoveOn is a full-stack B2C e-commerce platform focused on sports footwear. Customers can browse products, manage carts, place orders, track purchases, and interact with support services through a modern and responsive web application.

The platform includes both customer-facing features and administration tools, while implementing security, accessibility, and performance requirements expected from a production-ready application.

---

## 🚀 Key Features

### Customer Features
- Product browsing and search
- Product filtering and sorting
- Product recommendations
- Guest and authenticated shopping carts
- Secure checkout process
- Stripe payment integration
- Order history and tracking
- Product reviews and ratings
- FAQ and support ticket system
- Responsive design for desktop and mobile devices

### Administration Features
- Product management
- Brand and category management
- Product item and inventory management
- Order management
- User management and role assignment
- Review moderation
- Shipping method management
- Customer support dashboard

---

## 🔐 Security Features

- JWT authentication
- Refresh token handling
- Google OAuth login
- Two-Factor Authentication (2FA)
- Role-based access control (User, Support, Admin)
- Token bucket rate limiting
- Self-signed TLS certificate configuration
- Secure password reset workflow

---

## ⚡ Performance & Reliability

- RabbitMQ asynchronous processing
- Dockerized environment
- Load testing and performance analysis
- Optimized database queries
- Payment expiration handling
- Automated order status workflows

---

## ♿ Accessibility

- Keyboard navigation support
- Logical tab ordering
- Responsive layouts
- User-friendly error handling

---

## 🛠️ Technology Stack

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- RabbitMQ
- Stripe

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Infrastructure
- Docker
- Docker Compose

---

## 🎯 Project Goal

The goal of MoveOn is to demonstrate the design and implementation of a secure, scalable, and maintainable modern e-commerce platform that combines customer shopping experiences, business management tools, security controls, and performance optimization techniques.


## 📊 Entity Relationship Diagram (ERD)

[MoveOn ERD](docs/complete-erd.md)

This diagram represents the complete database structure of the MoveOn platform and the relationships between its core entities.

---

## 🧰 Tech Stack

- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL, JWT, Google OAuth, 2FA, RabbitMQ, Stripe
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router
- **Infrastructure:** Docker, Docker Compose
- **Services:** Stripe, Cloudinary, Google reCAPTCHA, Resend

---

## 🔐 Environment Variables (.env)

Before running the project, you must create **two environment files**:

```text
backend/.env.docker
frontend/.env.docker
```

Example files are provided:

```text
backend/.env.example
frontend/.env.example
```

Copy them and rename:

```text
backend/.env.example → backend/.env.docker
frontend/.env.example → frontend/.env.docker
```

These files contain API keys and configuration variables required for the application to run correctly.

---

## 🐳 Running the Project

### Requirements

Make sure the following tools are installed before running the project:

| Tool | Recommended Version |
|------|---------------------|
| Docker | 24.x or newer |
| Docker Compose | 2.x |
| Stripe CLI | Latest version |

The Stripe CLI is required only for local development.

Since the backend application is running locally and is not publicly accessible from the internet, Stripe cannot send webhook events directly to it.

---

### Check Installed Versions

```bash
docker --version
docker compose version
stripe --version
```

---

## 🚀 Build and Run the Project

This project runs using Docker containers. Docker starts the database, backend API, and frontend application.

### First Start

Clone the repository:

```bash
git clone https://gitea.kood.tech/irinapanivenko/i-love-shopping3.git
```

Start and build the application:

```bash
cd i-love-shopping3
docker compose up --build
```

The application will continue running in this terminal.

### Seed the Database

After the application has started, open **a second terminal** and run:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run prisma:seed"
```

This inserts initial data into the database.

Seeding is usually only needed:
- The first time you run the project
- After resetting the database
- After removing Docker volumes

After seeding the database, start the Stripe webhook listener(in another terminal):

```bash
stripe listen --forward-to http://127.0.0.1:3000/payments/webhook
```

Make sure the port used in the command matches the backend application port configured in the environment variables.


---

### Stop the Application

Stop the Stripe webhook listener that is running in **the second terminal**:

```text
CTRL + C
```

Then in the same terminal stop the Docker containers with:

```bash
docker compose stop
```

--- 

### Start the Application Again

If the project was already built and seeded, you can start it again with:

```bash
docker compose up
```

Open **a second terminal** and start the Stripe webhook listener:

```bash
stripe listen --forward-to http://127.0.0.1:3000/payments/webhook
```

---

## 📍 Access the Application

After the project starts, open in your browser:

```text
http://127.0.0.1:5173
```

Make sure to access the correct port from your `.env` file.

This is the MoveOn frontend application.

## 📖 Usage Guide

For a detailed walkthrough of the application's features and workflows, see:

[Usage Guide](docs/usage-guide.md)

---

## 📁 Project Structure

```text
moveon/
│
├── backend/                # NestJS backend application
│   ├── prisma/             # Prisma schema, migrations, seeds
│   ├── src/                # Backend source code
│   ├── test/               # Unit and E2E tests
│   └── Dockerfile
│
├── frontend/               # React frontend application
│   ├── public/
│   ├── src/                # Frontend source code
│   └── Dockerfile
│
├── docs/                   # Project documentation and diagrams
│
├── docker-compose.yml      # Full application container setup
└── README.md
```

The project is separated into independent frontend and backend applications connected through a REST API and Dockerized infrastructure.

---

## 📚 Documentation

Detailed documentation for the MoveOn platform.

### 🧱 Project 1 – Foundation

| Document | Description |
|---------|-------------|
| [API Documentation](docs/api.md) | Authentication, products, and search endpoints |
| [Authentication Flow](docs/auth-flow.md) | Login, refresh, session handling |
| [Registration Flow](docs/register-flow.md) | Email registration, OAuth registration, password setup |
| [Two-Factor Authentication](docs/2fa.md) | 2FA setup, verification, recovery codes |
| [Password Reset Flow](docs/password-reset.md) | Forgot password and reset password |
| [Filtering, Search and Sorting](docs/filters-search.md) | Product browsing logic |
| [Testing Guide](docs/testing.md) | Unit, integration, security, and manual tests |
| [Security Architecture](docs/security.md) | Security design and protections |
| [Review Questions](docs/review-questions.md) | Short explanations for key project review topics |

---

### 🛒 Project 2 – Commerce Flow & Payments

| Document | Description |
|---------|-------------|
| [Cart System](docs/cart-system.md) | Guest carts, authenticated carts, cart merge, and stock validation |
| [Checkout Flow](docs/checkout-flow.md) | Multi-step checkout workflow and order creation |
| [Payment Integration](docs/payments.md) | Stripe PaymentIntent flow, webhook handling, and payment lifecycle |
| [RabbitMQ Architecture](docs/rabbitmq.md) | Asynchronous event processing and queue consumers |
| [Order Management](docs/orders.md) | Order lifecycle, statuses, cancellations, and refunds |
| [Project 2 Testing](docs/testing-project2.md) | Cart, checkout, payment, and webhook testing |

---

## 🎯 Project 3 Deliverables

| Document | Description |
|----------|-------------|
| [Usage Guide](docs/usage-guide.md) | Application features and workflows |
| [Performance Testing](docs/perfomance/perfomance.md) | Load testing results and bottleneck analysis |
| [Rate Limiting](docs/token-bucket.md) | Token bucket implementation and testing |
| [TLS Configuration](docs/tls-certificate.md) | Self-signed TLS certificate setup and verification |
| [Automated Testing](docs/automated-tests.md) | Unit and integration testing |
| [Custom Error Pages](docs/error-pages.md) | 404 catch-all page implementation |
| [ERD](docs/complete-erd.md) | Complete database structure |

---

## 👤 Author

**Irina Panivenko**

Full-stack development student  
MoveOn B2C E-commerce Platform

---

## 📄 License

This project was developed for educational purposes.

---

