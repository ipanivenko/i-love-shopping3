# 🛡️ Security Architecture

The MoveOn platform is designed with security as a core foundation of the application.

The authentication and session system follows modern best practices commonly used in production applications.

---

## 🔐 Core Security Principles

The platform uses the following security mechanisms:
- Short-lived access tokens
- Long-lived refresh tokens stored in httpOnly cookies
- Refresh token rotation
- Password hashing
- Route protection with backend guards
- Rate limiting against brute-force attacks
- Two-Factor Authentication (2FA)
- Google OAuth support
- Password reset via expiring tokens
- Session storage and revocation in the database
- CAPTCHA protection on registration

---

## 🎟️ Token Strategy

### Access Token
- Stored in frontend memory only
- Used for authenticated API requests
- Short lifetime
- Sent in the `Authorization` header

### Refresh Token
- Stored in an **httpOnly cookie**
- Not accessible from JavaScript
- Used to keep the user logged in
- Rotated during refresh
- Can be revoked on logout or security events

This separation reduces risk while keeping the user session smooth.

---

## 🍪 Refresh Cookie Security

The refresh token is stored in a secure cookie because:
- JavaScript cannot read it
- It is automatically sent with requests
- It is better protected against token theft through frontend code

The backend reads the cookie during `/auth/refresh` and returns a new access token when valid.

---

## 🔄 Session Rotation and Revocation

Sessions are stored in the backend database.

This allows the application to:
- Rotate refresh tokens
- Revoke tokens on logout
- Revoke sessions on password reset
- Detect invalid or reused tokens
- Manage long-lived authenticated sessions more safely

---

## 🔑 Password Security

Passwords are never stored in plaintext.

The backend:
- Validates password format
- Hashes passwords before storage
- Compares hashed passwords during login

This ensures password confidentiality even if database data is exposed.

---

## 🔐 Two-Factor Authentication (2FA)

MoveOn supports TOTP-based Two-Factor Authentication.

2FA adds a second layer of security by requiring:
- The user password
- A time-based verification code from an authenticator app

Additional protections:
- 2FA secret stored securely
- Temporary token used during 2FA login flow
- Recovery codes generated as a backup
- Password confirmation required when disabling 2FA

---

## 🌐 Google OAuth Security

MoveOn supports Google OAuth for secure external authentication.

Benefits:
- Users can log in without creating a local password
- Authentication is delegated to Google
- Users can later add a password through account setup if needed

If an OAuth-only user wants password login or 2FA, they must set a password first.

---

## ♻️ Password Reset Security

The forgot-password flow includes:
- Expiring reset tokens
- Single-use reset links
- Session revocation after password reset
- Protection against email enumeration
- Rate limiting on reset endpoints

This protects users against account discovery and token abuse.

---

## 🚦 Rate Limiting

Authentication endpoints use throttling to reduce brute-force and spam attempts.

Examples:
- Login attempts are limited
- Refresh attempts are limited
- Forgot-password attempts are limited
- Reset-password attempts are limited

This makes abusive automated requests harder.

---

## 🤖 CAPTCHA Protection

Registration is protected with Google reCAPTCHA.

This helps prevent:
- Automated account creation
- Bot-based abuse
- Mass registration attempts

CAPTCHA is validated on the backend for better trust.

---

## 🧱 Backend Guards and Middleware

Sensitive routes are protected on the backend using:
- JWT authentication guards
- Validation pipes
- Request throttling
- Cookie verification
- Input validation

The frontend manages session state, but the backend remains the final source of truth for security.

---

## 🧠 Security Summary

| Security Layer | Purpose |
|---------------|---------|
| JWT Access Token | Authenticated API access |
| Refresh Cookie | Persistent login |
| Session Storage | Rotation and revocation |
| Password Hashing | Protect stored credentials |
| 2FA | Extra login protection |
| OAuth | External identity provider |
| CAPTCHA | Bot protection |
| Rate Limiting | Brute-force mitigation |
| Backend Guards | Route protection |

MoveOn uses a layered security approach so that authentication, session management, and user access remain protected across the application.