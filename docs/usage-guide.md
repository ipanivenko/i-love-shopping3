# MoveOn Usage Guide

## Introduction

MoveOn is an e-commerce platform with three different user roles:

- User
- Support
- Administrator

Each role has access to different features and permissions.

---

# User Guide

Regular users can browse products, place orders, manage their account, and communicate with support.

## Registration

1. Open the application.
2. Click user button -> create account.
3. Enter name, email, and password, check "I'm not a robot".
4. Submit the registration form.
5. Log in using the created account.

Alternatively, you can sign in using Google and skip the manual registration process by clicking "Continue with Google".

---

## Login

1. Click user button.
2. Enter email and password.
3. Complete two-factor authentication if enabled.

---

## Browse Products

Users can:

- View all products
- Search products
- Filter by brand
- Filter by gender
- Filter by surface
- Filter by rating
- Filter by price
- Sort products

---

## Product Details

Users can open a product page to view:

- Images
- Description
- Price
- Available sizes
- Available colors
- Reviews
- Recommended products

---

## Shopping Cart

Users can:

- Add products to cart
- Remove products from cart
- Change quantities
- View cart total

---

## Checkout

1. Open the cart.
2. Click **Go to checkout**.
3. Enter shipping information.
4. Select a delivery method.
5. Create the order by pressing "Place order".

---

## Payment

Orders can be paid through Stripe.

The following Stripe test cards can be used during development:

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Simulated payment failure |

Any future expiration date and any 3-digit CVC can be used in test mode.

---

## Order History

Users can view:

- Previous orders
- Current orders
- Order details
- Order status

In order to open orders press Orders button in the header.
---

## Order Cancellation

Users can cancel their orders from the **My Orders** page.

### Automatic Cancellation

If the order has not yet been processed, the cancellation is performed immediately and the order status is updated automatically.

### Cancellation Request

If the order has already entered processing, shipping, or another fulfillment stage, the user can submit a cancellation request.

In this case:

1. The order status changes to **Cancel Requested**.
2. An administrator reviews the request.
3. The administrator can either approve or reject the cancellation.

If approved:

- The order status becomes **Cancelled**.
- Any applicable refund is processed.
- Product stock is restored when appropriate.

If rejected:

- The order continues through the normal fulfillment process.
---

## Product Reviews

Users can leave reviews for products they have purchased.

Each review contains:

- Rating
- Comment

---

## Support Tickets

Users can:

1. Open Contact Support.
2. Submit a support request.
3. Track previous support tickets.
4. Read support responses.

---


# Administrator Guide

Administrators have full access to platform management features, including products, orders, users, reviews, delivery options, and platform administration tools.

## Creating an Administrator Account

Before a user can be granted administrator privileges, **Two-Factor Authentication (2FA)** must be enabled on their account.

### Step 1: Enable 2FA

1. Log in with the user account.
2. Open the **User Profile** menu by pressing user button.
3. Select **Set Up 2fa**.
4.  the generated manual secret.

---

### Generating TOTP Codes Without an Authenticator App

If an authenticator application is unavailable, TOTP codes can be generated using the provided test script.

The script is located in:

```text
backend/test-totp.ts
```

Replace the placeholder secret with the **manual secret** generated during the 2FA setup process.

```bash
const secret = 'YOUR_SECRET'
```

Run the script:

```bash
docker compose exec backend sh -c "cd /app/backend && npx ts-node test-totp.ts"
```

> **Important**
>
> - TOTP codes are valid for only 30 seconds.
> - If a code expires, simply run the script again to generate a new one.
> - The same manual secret must be used whenever generating future codes for login or disabling 2FA.
> - As long as you intend to use this account, keep its manual secret stored in the script. Whenever a 2FA-protected action is required, such as logging in or disabling 2FA, run the script to generate a valid TOTP code using the same secret.

Once 2FA has been successfully confirmed, the account becomes eligible for administrative privileges.

---

### Step 2: Grant Administrator Permissions

Run the following command from the project root directory:

```bash
docker compose exec backend sh -c "cd /app/backend && npm run make-admin -- adminemail@gmail.com long-random-secret"
```

Replace:

- `adminemail@gmail.com` with the user's email address
- `long-random-secret` with the configured administrator promotion secret from .env.docker

After the command completes successfully, the user will be assigned the **ADMIN** role.

---

## Accessing the Administration Panel

Administrators can access the administration area at:

```text
/admin
```

The administration panel provides access to:

- Product Management
- Product Item Management
- Brand Management
- Category Management
- Order Management
- User Management
- Review Moderation
- Delivery Option Management
---

## Product Management

Administrators can:

- Create products
- Edit products
- Delete products
- Manage product information

---

## Product Item Management

Administrators can:

- Create colors
- Upload product images
- Create SKUs
- Manage stock quantities

---

## Bulk Product Upload

Administrators can upload multiple products and images simultaneously using the Bulk Upload feature.

### Accessing Bulk Upload

1. Log in as an administrator.
2. Navigate to **Admin → Products**.
3. Click the **Bulk Upload** button.

### Uploading Products

1. Select the upload format:
   - JSON
   - CSV

2. Choose the product data file.

3. Select all product images referenced by the file.

4. Click **Upload**.

### Sample Files

Example files are provided with the project:

```text
docs/uploadCSV/
docs/uploadJSON/
```

Each folder contains:

- A sample product file (`products.csv` or `products.json`)
- An `images` folder containing all required product images

### Important

When uploading products:

1. Select the product file:

```text
products.csv
```

or

```text
products.json
```

2. Select **all images** located inside the corresponding folder.


The image filenames must match the filenames referenced in the CSV or JSON file.

### Result

After a successful upload:

- Products are created automatically.
- Product images are uploaded and linked.
- Product variants and stock quantities are created.
- Products become immediately available in the storefront.

## Brand Management

Administrators can:

- Create brands
- Edit brands
- Delete brands

---

## Category Management

Administrators can:

- Create categories
- Edit categories
- Delete categories

---

## Delivery Method Management

Administrators can:

- Create delivery options
- Update delivery prices
- Update delivery estimates
- Enable or disable delivery methods

---

## Order Management

Administrators can:

- View all orders
- Review order details
- Approve cancellation requests
- Process refunds

---

## User Management

Administrators can:

- View users
- Search users
- Filter users by role
- Assign roles

Available roles:

- USER
- SUPPORT
- ADMIN

Only users with confirmed 2FA can receive administrative roles.

---

## Review Moderation

Administrators can:

- Edit reviews
- Delete reviews

---

# Support Guide

Support users manage customer support requests and FAQ content.

## Access Support Dashboard

### Assigning the Support Role

1. Log in using an administrator account.
2. Navigate to **Admin → Users**.
3. Locate the user you wish to promote.
!Important: The future support user 2fa must be enabled
4. Select **SUPPORT** from the Role dropdown.
5. The user's role will be updated immediately.

Once assigned, the user will gain access to the Support Dashboard and support management features.

Support accounts can access:

/support-admin

---

## View Tickets

Support users can:

- View all support tickets
- Open ticket details
- Review customer messages

---

## Answer Tickets

1. Open a ticket.
2. Enter a response.
3. Submit the answer.

The ticket status changes accordingly.

---

## Close Tickets

Support users can close resolved tickets.

Possible statuses:

- OPEN
- ANSWERED
- CLOSED

---

## Create FAQ Entries

Support users can convert solved tickets into FAQ entries.

This allows frequently asked questions to be reused for future customers.

---
