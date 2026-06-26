import { API } from '../config'
import { apiFetch } from './apiFetch'

export type ConfirmTwoFactorPayload = {
  code: string
}

export type ConfirmTwoFactorResponse = {
  enabled: boolean
  recoveryCodes?: string[]
}

export async function confirmTwoFactor(
  payload: ConfirmTwoFactorPayload,
  accessToken?: string
) {
  const response = await apiFetch(`${API}/auth/2fa/confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as
    | ConfirmTwoFactorResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const errorMessage =
      data && typeof data === 'object' && 'message' in data
        ? data.message
        : 'Failed to confirm 2FA'

    throw new Error(String(errorMessage))
  }

  if (!data || !('enabled' in data)) {
    throw new Error('Invalid 2FA confirm response')
  }

  return data
}