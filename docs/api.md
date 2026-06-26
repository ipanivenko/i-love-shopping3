# 🔗 API Documentation

The MoveOn backend exposes several REST API endpoints for authentication, products, and search.

Base URL (local development):

```text
http://127.0.0.1:3000
```

---

## 🔐 Authentication Endpoints (`/auth`)

| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| GET | /auth/me | Get current user |
| PATCH | /auth/setup-account | Complete OAuth account |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout user |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password |
| GET | /auth/google | Google OAuth login |
| GET | /auth/google/callback | Google OAuth callback |
| POST | /auth/2fa/setup | Setup 2FA |
| POST | /auth/2fa/confirm | Confirm 2FA |
| POST | /auth/2fa/verify | Verify 2FA during login |
| POST | /auth/2fa/disable | Disable 2FA |

---

## 👟 Products Endpoints (`/products`)

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | /products | Get products list with filters |
| GET | /products/filters | Get available filters |
| GET | /products/:slug | Get product details |

### Example Requests

Get all products:

```http
GET /products
```

Get products with filters:

```http
GET /products?brand=nike&gender=MEN&priceMin=5000&priceMax=15000
```

Get product details:

```http
GET /products/nike-air-zoom-pegasus-41
```

---

## 🔎 Search Endpoints (`/search`)

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | /search/suggestions | Search suggestions |

Example:

```http
GET /search/suggestions?query=nike
```

This endpoint returns:
- Matching products
- Matching brands
- Matching categories

It is used for the search bar autocomplete.

---

## 📡 API Summary

| Module | Base Route |
|-------|------------|
| Authentication | /auth |
| Products | /products |
| Search | /search |

Full API Base URL:

```text
http://127.0.0.1:3000
```