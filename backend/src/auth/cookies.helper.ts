import { Response } from 'express';

export function SetRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
        // SECURITY: JavaScript cannot access this cookie
        httpOnly: true,
        // Prevents the cookie from being sent on cross-site requests (prevents CSRF)
        sameSite: 'lax',
        // SECURITY: Only send over HTTPS in production (prevents packet sniffing)
       // secure: process.env.NODE_ENV === 'production',
        // PERFORMANCE: The browser only sends this cookie to this specific endpoint.
        // This keeps other API requests "light" by not attaching the heavy refresh token.
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}


export function ClearRefreshCookie(res: Response) {
    res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'lax',
       // secure: process.env.NODE_ENV === 'production',
        path: '/auth/refresh',
    })
}

export function SetTemp2faCookie(res: Response, token: string) {
    res.cookie('temp_2fa_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        //secure: process.env.NODE_ENV === 'production',
        path: '/auth/2fa/verify',
        maxAge: 5 * 60 * 1000,
    });
}

export function ClearTemp2faCookie(res: Response) {
    res.clearCookie('temp_2fa_token', {
        httpOnly: true,
        sameSite: 'lax',
        //secure: process.env.NODE_ENV === 'production',
        path: '/auth/2fa/verify',
    });
}