# 🛒 Cart System

## 📌 Overview

The MoveOn platform includes a shopping cart system that supports both guest users and authenticated users.

The cart system was designed to provide:
- Persistent shopping experience
- Stock validation
- Quantity management
- Cart synchronization
- Guest-to-user cart migration after login

The system validates product availability before checkout and helps prevent invalid orders caused by out-of-stock products or unavailable SKUs.

---

# 👤 Guest Cart

Guest users can add products to the cart without creating an account.

Guest cart data is stored locally in the browser using:

```text
localStorage
```

The guest cart contains:
- Product SKU identifiers
- Quantities
- Product metadata used for display

---

## Guest Cart Features

- Add products to cart
- Remove products from cart
- Update quantities
- Persist cart between page refreshes
- Validate stock before checkout
- Merge into authenticated cart after login

---

# 🔐 Authenticated User Cart

When a user is authenticated, cart data is stored in the database.

Main entities:
- Cart
- CartItem

Each authenticated user can own one cart containing multiple cart items.

---

## Database Relationships

```text
User
 └── Cart
       └── CartItem
              └── ProductSku
```

---

# 🔄 Cart Merge After Login

When a guest user logs into an account, the system automatically merges the guest cart into the authenticated user cart.

The merge process:
1. Reads guest cart data from local storage
2. Validates SKU existence
3. Validates stock quantities
4. Merges quantities safely
5. Removes the local guest cart

This prevents users from losing cart data during authentication.

---

# 📦 Stock Validation

The cart system validates:
- SKU existence
- Product availability
- Available stock quantity

Validation occurs:
- When adding products
- When updating quantities
- During cart preview
- Before checkout

If a user returns to the cart later and a product becomes unavailable or the requested quantity exceeds the available stock, the cart is automatically updated.

Possible automatic adjustments:
- Removing unavailable products
- Reducing quantities to available stock levels
- Returning warning messages to the frontend

This helps keep the cart synchronized with the current inventory state and prevents invalid checkout attempts.

---

## Cart Warning Types

The backend can return cart warnings such as:

```text
SKU_NOT_FOUND
PRODUCT_NOT_AVAILABLE
OUT_OF_STOCK
QUANTITY_ADJUSTED
```

These warnings help prevent invalid purchases and improve checkout reliability.

---

# 🧮 Quantity Management

Users can:
- Increase quantities
- Decrease quantities
- Remove items completely

The backend enforces stock limits to prevent quantities exceeding available inventory.

---

# 🔄 Real-Time Cart Updates

The frontend updates cart data dynamically after:
- Adding products
- Updating quantities
- Removing products
- Authentication changes

Cart totals and item counts are recalculated automatically.

---

# 🏗️ Cart Architecture

```text
Frontend Cart UI
        |
        v
Cart API Endpoints
        |
        v
Cart Service
        |
        v
PostgreSQL Database
```

---

# 🔌 Main Cart Endpoints

| Endpoint | Description |
|---|---|
| `GET /cart` | Retrieve authenticated user cart |
| `POST /cart/items` | Add item to cart |
| `PATCH /cart/items/:id` | Update cart item quantity |
| `DELETE /cart/items/:id` | Remove item from cart |
| `GET /cart/preview` | Validate cart before checkout |

---

# ✅ Cart System Goals

The cart system was designed to provide:
- Reliable cart persistence
- Safe stock handling
- Smooth guest checkout experience
- Seamless authentication transitions
- Scalable commerce workflows

---