# 🔐 Authentication Flow

The MoveOn platform uses a modern authentication system based on:
- JWT Access Tokens
- Refresh Tokens stored in httpOnly cookies
- Google OAuth
- Two-Factor Authentication (2FA)

This architecture allows secure authentication while keeping the user logged in without storing sensitive tokens in browser storage.

---

## 🧭 Login Flow (Email / Password or Google OAuth)

### Email & Password Login

1. User enters email and password
2. Frontend → `POST /auth/login`
3. Backend verifies credentials
4. Backend generates:
   - Access Token (short lifetime)
   - Refresh Token (long lifetime)
5. Backend:
   - Returns access token in JSON
   - Sets refresh token in httpOnly cookie
6. Frontend saves access token in **AuthContext**
7. User is logged in

---

### Google OAuth Login

1. User clicks **Login with Google**
2. Frontend redirects → `/auth/google`
3. Backend redirects to Google login page
4. User authenticates with Google
5. Google redirects back → `/auth/google/callback`
6. Backend creates or finds user account
7. Backend generates tokens
8. Backend:
   - Sets refresh token cookie
   - Redirects user to frontend `/oauth-success`
9. Frontend calls `/auth/refresh`
10. Backend returns access token
11. Frontend stores access token in AuthContext
12. User is logged in

---

## 🔐 Login With 2FA Enabled

If the user has Two-Factor Authentication enabled:

1. User logs in (email/password or Google)
2. Backend detects 2FA enabled
3. Backend returns `requires2fa = true`
4. Backend sets temporary 2FA cookie
5. Frontend redirects to the 2FA verification page
6. User enters 6-digit code from authenticator app
7. Frontend → `POST /auth/2fa/verify`
8. Backend verifies code
9. Backend issues:
   - Access token
   - Refresh token cookie
10. User is fully logged in

---

## 🔄 When Access Token Expires

1. Frontend sends API request with access token
2. Backend returns **401 Unauthorized**
3. Frontend detects 401
4. Frontend → `POST /auth/refresh`
5. Refresh cookie is automatically sent
6. Backend verifies refresh token
7. Backend returns a new access token
8. Frontend updates AuthContext
9. Original request is retried automatically
10. User stays logged in

This is called **silent session refresh**.

---

## 📦 Where Everything Lives

| Item | Location | Purpose |
|------|---------|---------|
| Access Token | Frontend memory (AuthContext) | Used for API requests |
| Refresh Token | httpOnly Cookie | Keeps user logged in |
| User Info | Frontend Context | UI state |
| JWT Verification | Backend Guards | Security |
| Password | Backend Database | Never stored in frontend |
| Sessions | Backend Database | Refresh token rotation |
| Logout | Backend + Frontend | Clear cookie + clear context |

---

## 🧠 Architecture Summary

| Component | Responsibility |
|-----------|---------------|
| Backend Middleware | Security |
| Backend Guards | Protect routes |
| Frontend Context | Store user session |
| Refresh Cookie | Keep login alive |
| Access Token | Call API |

**Backend = Security**  
**Frontend = Session state / UI**

Both are required for a secure authentication system.

---

## 🔧 `apiFetch` Responsibilities

All frontend API calls go through a helper called **apiFetch**.

`apiFetch` automatically:
- Adds the Authorization header with the access token
- Sends cookies (`credentials: include`)
- Detects **401 Unauthorized**
- Calls `/auth/refresh`
- Gets a new access token
- Retries the original request
- Logs out the user if refresh fails
- Parses JSON response
- Handles errors consistently

---

## 📊 `fetch` vs `apiFetch`

| Feature | fetch | apiFetch |
|--------|------|----------|
| Send request | Yes | Yes |
| Add Authorization header | Manual | Automatic |
| Send cookies | Manual | Automatic |
| Handle 401 | Manual | Automatic |
| Refresh token | No | Yes |
| Retry request | No | Yes |
| Logout on refresh fail | No | Yes |
| JSON parsing | Manual | Automatic |
| Error handling | Manual | Centralized |