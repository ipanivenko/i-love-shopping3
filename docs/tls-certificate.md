# Self-Signed TLS Certificate

The application is configured to support HTTPS through a self-signed TLS certificate.

For normal development, the project runs over HTTP. This is a common practice because the frontend and backend run locally on the same machine, traffic does not leave the development environment, and HTTP simplifies local development by avoiding certificate management and browser trust configuration.

Using HTTP during development also prevents unnecessary changes to OAuth callback URLs, cookie settings, and other environment-specific configurations.

HTTPS support has nevertheless been implemented to demonstrate secure communication and TLS configuration. When enabled, all traffic between the frontend and backend is encrypted using a self-signed certificate.

## Enable HTTPS

1. Change `backend/.env`:

```env
HTTPS_ENABLED=true
```

2. Change `frontend/.env`:

```env
VITE_API_URL=https://127.0.0.1:3000
```

3. Restart the application.

4. Open the application in the browser.

5. If a browser security warning appears:
   - Click **Advanced**
   - Click **Proceed to 127.0.0.1 (unsafe)**

6. Refresh the browser page.

The application will now communicate with the backend over HTTPS.

## Disable HTTPS

```env
HTTPS_ENABLED=false
```

```env
VITE_API_URL=http://127.0.0.1:3000
```

After changing the configuration, restart both backend and frontend.

> Note: The self-signed certificate is intended for local development and educational demonstration purposes only. In a production environment, a certificate issued by a trusted Certificate Authority should be used.