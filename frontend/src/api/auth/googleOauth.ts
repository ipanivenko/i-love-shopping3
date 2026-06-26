import { API } from "../config";

type CompleteGoogleOauthResponse = {
    accessToken: string
}

export async function completeGoogleOauth() {
    const response = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    })

    const data = (await response.json().catch(() => null)) as
        | CompleteGoogleOauthResponse
        | { message?: string }
        | null

    if (!response.ok) {
        const errorMessage = (data && typeof data === 'object' && 'message' in data)
            ? data.message
            : 'Failed to complete Google sign-in';

        throw new Error(String(errorMessage));
    }

    if (!data || !('accessToken' in data) || !data.accessToken) {
        throw new Error('Missing access token')
    }

    return data
}