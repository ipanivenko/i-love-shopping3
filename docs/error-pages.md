# 404 Error Handling and Catch-All Page

## Overview

The application implements a custom 404 error handling strategy to provide a consistent and user-friendly experience when users attempt to access pages or resources that do not exist.

Two types of "not found" situations are handled:

1. Invalid URL routes (catch-all routing)
2. Valid routes with missing resources (e.g., non-existent product or order)

---

## Catch-All Route

A wildcard route is configured as the last route in the application routing configuration.

```tsx
<Route path="*" element={<NotFoundPage />} />
```

This route catches any URL that does not match an existing route and displays a custom 404 page.

### Examples

The following URLs will display the 404 page:

```text
/non-existent-page
/random-url
/admin/unknown-page
/products/123/invalid
```

---

## Resource-Specific 404 Handling

Some URLs match valid routes but reference resources that do not exist.

Examples:

```text
/products/non-existent-product
/payment/invalid-order-id
/order-confirmation/invalid-order-id
/admin/products/99999/items
```

In these cases, the frontend calls the API to retrieve the requested resource.

If the backend returns HTTP 404, a custom `NotFoundError` is thrown.

Example:

```ts
if (res.status === 404) {
  throw new NotFoundError('Product not found')
}
```

The page then renders the custom 404 page instead of displaying a generic API error message.

Example:

```tsx
if (error instanceof NotFoundError) {
  return (
    <NotFoundPage
      title="Product not found"
      message="This product does not exist or is no longer available."
    />
  )
}
```

---

## Custom 404 Page

A dedicated `NotFoundPage` component provides a consistent user experience across the application.

Features include:

- Large 404 status indicator
- User-friendly error message
- Navigation back to shopping pages
- Links to FAQ and Support pages
- Responsive design
- Accessible keyboard navigation
- Consistent branding and styling

The page uses a green-themed design to match the application's visual identity.

---

## Testing

### Invalid Route Test

Navigate to:

```text
http://127.0.0.1:5173/this-page-does-not-exist
```

Expected result:

- The custom 404 page is displayed.

### Missing Product Test

Navigate to:

```text
http://127.0.0.1:5173/products/non-existent-product
```

Expected result:

- Product API returns HTTP 404.
- The custom 404 page is displayed.

### Missing Order Test

Navigate to:

```text
http://127.0.0.1:5173/order-confirmation/invalid-order-id
```

Expected result:

- Order API returns HTTP 404.
- The custom 404 page is displayed.

---

## Requirement Coverage

✔ Error page (404) includes catch-all error message.

✔ Invalid routes are handled through a wildcard route.

✔ Missing resources are handled through API-level 404 detection.

✔ Users receive a clear and consistent error experience.