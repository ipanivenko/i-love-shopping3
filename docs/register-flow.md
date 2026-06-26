# 📝 Registration Flow

Users can create an account using either:
- Email and password registration
- Google OAuth login (without manual registration)

Google OAuth allows users to access the platform without creating a password initially.

---

## 📧 Email Registration Flow

Users can create an account with a standard registration form protected by **Google reCAPTCHA**.

1. User enters name, email, and password
2. User completes the **Google reCAPTCHA** challenge
3. Frontend sends the registration request → `POST /auth/register`
4. Backend validates:
   - required fields
   - email format
   - password rules
   - reCAPTCHA token
5. Backend hashes the password
6. Backend creates the user in the database
7. User can now log in using email and password
8. User may enable Two-Factor Authentication later

This registration flow helps protect the platform against automated bot registrations while keeping the signup process simple for real users.

---

## 🔵 Registration via Google OAuth

Users can also create an account using Google OAuth.

1. User clicks **Login with Google**
2. Frontend redirects → `/auth/google`
3. Backend redirects to Google login
4. User authenticates with Google
5. Google redirects back → `/auth/google/callback`
6. Backend creates a user account without password
7. Backend logs the user in
8. User can use the platform without registering manually

This means users can **skip the registration form completely** by using Google OAuth.

---

## 🔐 Setting Password After OAuth Registration

If a user registered via Google OAuth and later wants to log in using email and password, they must first **set up their account password**.

Steps:
1. User logs in with Google
2. User clicks the **User button**
3. User opens **Account Settings**
4. User sets a password using the account setup form
5. Frontend → `PATCH /auth/setup-account`
6. Backend saves the hashed password
7. User can now log in using email and password

Important:
- OAuth users do not have a password initially
- Password must be created through **Account Setup**
- After setting a password, both login methods work:
  - Email & Password
  - Google OAuth

---

## 🔐 Two-Factor Authentication Requirement

To enable **Two-Factor Authentication (2FA)**, the user must have a password set on the account.

This is required because disabling 2FA requires password confirmation for security reasons.

| Account Type | Can Enable 2FA |
|--------------|----------------|
| Email/Password account | Yes |
| OAuth account without password | No |
| OAuth account after password setup | Yes |

If a user signed up with Google OAuth and wants to enable 2FA:
1. Login with Google
2. Go to Account Settings
3. Set account password
4. Enable 2FA

---

## 📊 Registration Summary

| Action | Endpoint |
|--------|----------|
| Register with email | POST /auth/register |
| Login | POST /auth/login |
| Google login | GET /auth/google |
| Setup password (OAuth users) | PATCH /auth/setup-account |
| Enable 2FA | POST /auth/2fa/setup |
| Confirm 2FA | POST /auth/2fa/confirm |

---

## 🧭 Account Creation Logic Summary

| User Action | Result |
|-------------|--------|
| Register with email/password | Account created with password |
| Login with Google | Account created without password |
| OAuth user sets password | Account becomes a full account |
| Full account | Can enable 2FA |
| OAuth without password | Cannot enable 2FA |

This system allows flexible registration while maintaining security for password-based authentication and Two-Factor Authentication.