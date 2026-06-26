# 🔐 Two-Factor Authentication (2FA)

MoveOn supports **Two-Factor Authentication (2FA)** using TOTP (Time-based One-Time Password), compatible with apps like:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Bitwarden

2FA adds an additional security layer during login.

**Managing 2FA:** click the User button while logged in to access the Account Setup page. From there, users can enable or disable Two-Factor Authentication.

---

## 🔑 2FA Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | /auth/2fa/setup | Generate QR code and secret |
| POST | /auth/2fa/confirm | Confirm first code and enable 2FA |
| POST | /auth/2fa/verify | Verify code during login |
| POST | /auth/2fa/disable | Disable 2FA |

---

## 🧭 2FA Setup Flow

### Enabling 2FA

1. User logs in
2. User calls → `POST /auth/2fa/setup`
3. Backend returns:
   - QR code
   - Manual secret
4. User scans the QR code with an authenticator app
5. User enters the 6-digit code
6. Frontend calls → `POST /auth/2fa/confirm`
7. Backend enables 2FA
8. Backend generates **recovery codes**
9. User must save the recovery codes securely

After this, 2FA is enabled for the account.

---

## 🔐 Login With 2FA Enabled

1. User logs in with email/password or Google OAuth
2. Backend detects that 2FA is enabled
3. Backend returns `requires2fa = true`
4. Frontend redirects to the 2FA page
5. User enters the 6-digit code from the authenticator app
6. Frontend calls → `POST /auth/2fa/verify`
7. Backend verifies the code
8. Backend issues access token + refresh cookie
9. User is logged in

---

## 🧾 Recovery Codes

When 2FA is enabled for the first time, the backend generates **recovery codes**.

Recovery codes allow the user to log in if they lose access to the authenticator app.

Important rules:
- Each recovery code can be used only once
- Recovery codes are stored hashed in the database
- User should store them in a safe place
- If all recovery codes are used, the user should generate new ones

Recovery codes act as a **backup login method**.

---

## 🧪 Generating TOTP Codes Without an Authenticator App

If you do not have an authenticator app, you can generate a TOTP code manually using the test script.

There is a file in the backend folder:

```text
backend/test-totp.ts
```

Run it from the backend folder with:

```bash
node test-totp.ts
```

Important: You must paste your **manual secret** into the configuration file before execution. Since 2FA codes regenerate every **30 seconds**, ensure the script is synchronized; if a code fails, simply re-run the script. To log in or disable 2FA, you must use **the same manual secret** generated during the initial setup.

Example script:

```ts
import speakeasy from 'speakeasy'

const secret = 'PASTE_YOUR_SECRET_HERE'

const token = speakeasy.totp({
  secret,
  encoding: 'base32',
})

console.log('Your 6-digit code:', token)
```

This generates a valid 6-digit 2FA code that can be used for:
- Confirming 2FA
- Logging in with 2FA
- Testing the authentication flow

---

## 🔐 2FA Summary

| Action | Endpoint |
|-------|----------|
| Setup 2FA | /auth/2fa/setup |
| Confirm 2FA | /auth/2fa/confirm |
| Verify during login | /auth/2fa/verify |
| Disable 2FA | /auth/2fa/disable |

2FA improves account security by requiring a second authentication factor in addition to the password.