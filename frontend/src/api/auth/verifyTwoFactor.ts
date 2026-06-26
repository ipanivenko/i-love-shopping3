import { API } from '../config'
import { apiFetch } from './apiFetch'

type VerifyTwoFactorPayload = {
  code: string
}

type VerifyTwoFactorResponse = {
  accessToken: string
}

export async function verifyTwoFactor(payload: VerifyTwoFactorPayload) {
  const response = await apiFetch(`${API}/auth/2fa/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as
    | VerifyTwoFactorResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const errorMessage =
      data && typeof data === 'object' && 'message' in data
        ? data.message
        : 'Failed to verify authentication code'

    throw new Error(String(errorMessage))
  }

  if (!data || !('accessToken' in data) || !data.accessToken) {
    throw new Error('Missing access token')
  }

  return data
}