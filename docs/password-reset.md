# 🔑 Forgot Password & Reset Password Flow

The MoveOn platform allows users to reset their password securely via email using a password reset token system.

This flow ensures that:
- Password reset links expire
- Tokens are single-use
- Emails cannot be enumerated
- Password reset is secure

---

## 🧭 Forgot Password Flow

1. User clicks **Forgot Password** on the login page
2. User enters their email
3. Frontend → `POST /auth/forgot-password`
4. Backend generates:
   - Reset ID (`rid`)
   - Reset token
   - Expiration time
5. Backend sends an email with the reset link
6. The email contains a link like:

```text
http://127.0.0.1:5173/reset-password?rid=...&token=...
```

7. User opens the link
8. User enters a new password
9. Frontend → `POST /auth/reset-password`
10. Backend verifies `rid` and token
11. Backend updates the password
12. All existing sessions are revoked
13. User can log in with the new password

---

## 🔐 Security Features

The password reset system includes several security protections:

| Feature | Description |
|--------|-------------|
| Email enumeration protection | `/forgot-password` always returns `{ ok: true }` |
| Token expiration | Reset tokens expire after a limited time |
| Single-use tokens | Token cannot be reused |
| Password hashing | New password is hashed before storage |
| Session revocation | All sessions are revoked after password reset |
| Rate limiting | Forgot/reset endpoints are rate limited |

---

## 📡 Password Reset Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | /auth/forgot-password | Request password reset email |
| POST | /auth/reset-password | Reset password using token |

---

## 🧠 Password Reset Summary

| Step | Action |
|------|--------|
| 1 | User requests password reset |
| 2 | Backend sends email with reset link |
| 3 | User opens reset link |
| 4 | User submits new password |
| 5 | Backend verifies token |
| 6 | Password updated |
| 7 | Sessions revoked |
| 8 | User logs in again |

This flow ensures secure password recovery without exposing user accounts or sensitive authentication details.