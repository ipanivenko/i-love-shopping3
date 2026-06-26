# Review Questions

This document contains short explanations of important technical concepts used in the MoveOn B2C e-commerce platform.

---

## 1. JWT Concept and Components

JWT stands for **JSON Web Token**. It is a compact token format used to securely transmit information between the backend and the frontend.

A JWT is composed of three parts:

- **Header** → contains metadata about the token, such as the algorithm used for signing
- **Payload** → contains the token data, for example the user id or session information
- **Signature** → verifies that the token has not been modified and that it was signed by the backend using a secret key

In MoveOn, JWT is used for authentication:
- the **access token** is short-lived and used to call protected API routes
- the **refresh token** is long-lived and used to obtain a new access token when the old one expires

This approach provides secure and scalable session handling.

---

## 2. Database Scalability Features

The platform uses **PostgreSQL** as the relational database.

PostgreSQL supports scalability through several important features:
- strong indexing support for faster queries
- relational design with normalized tables
- support for joins and structured queries
- reliable handling of growing datasets
- transactional consistency
- ability to optimize performance through indexes, query tuning, and schema design

For MoveOn, the database is designed with separate entities such as:
- users
- sessions
- brands
- categories
- products
- product colors
- product images
- product sizes

This separation improves maintainability and supports future growth as more users, products, and sessions are added.

---

## 3. ACID Properties and Their Importance

ACID stands for:

- **Atomicity** → a transaction is completed fully or not at all
- **Consistency** → the database always stays in a valid state
- **Isolation** → simultaneous operations do not interfere incorrectly with each other
- **Durability** → once committed, data is reliably stored

These properties are very important in e-commerce systems.

In MoveOn, ACID principles are important because the platform must reliably handle:
- account creation
- session creation
- refresh token rotation
- password reset flows
- future order and payment related operations

Without ACID guarantees, the system could produce invalid or partial data, which is especially dangerous in commerce systems.

---

## 4. Search Implementation

The MoveOn platform implements search through the backend and database query logic.

The search functionality is based on:
- product names
- brand names
- category names

There are two main search-related features:

### Product Search
Users can search products through query parameters on the `/products` endpoint.

Example:
```http
GET /products?query=nike
```

### Search Suggestions
The platform also provides autocomplete suggestions through:
```http
GET /search/suggestions?query=nike
```

This endpoint returns matching:
- products
- brands
- categories

The database design supports search because products are related to brands and categories through structured relational tables.

The platform also supports **relevance sorting**, but only when the user types a search query. This improves usability by showing the best matching results first.

---

## 5. Testing Approach

The project combines **automated tests** and **manual tests**.
For more information:
 [Testing guide](testing.md)

### Automated Testing
Automated testing is used for:
- unit tests
- integration tests
- end-to-end security tests

The project uses:
- **Jest**
- **Supertest**
- **@nestjs/testing**

Automated tests verify:
- JWT token handling
- DTO validation
- authentication service logic
- endpoint behavior
- refresh token flow
- security-related input validation

### Manual Testing
Manual testing is still required for flows that depend on browser behavior or third-party services, such as:
- Google OAuth
- Google reCAPTCHA
- Two-Factor Authentication setup
- password reset email links

This mixed approach provides both strong automated coverage and practical real-world verification.

---

## 6. Architectural Approach and Scalability

The platform uses a **separated frontend-backend architecture**:

- **Frontend** → React application
- **Backend** → NestJS REST API
- **Database** → PostgreSQL
- **Image Storage** → Cloudinary

This architecture aligns well with scalability requirements because responsibilities are clearly separated:

- the frontend handles UI and session state
- the backend handles business logic and security
- the database handles structured persistence
- Cloudinary handles media storage

This design is scalable because:
- frontend and backend can evolve independently
- backend routes can be extended without changing the full architecture
- database schema can grow with new business features
- media storage is externalized instead of stored directly in the database
- Docker provides consistent local execution and easier deployment preparation

This makes the foundation suitable for future growth of the platform.