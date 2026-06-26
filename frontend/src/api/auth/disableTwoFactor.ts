import { API } from '../config'
import { apiFetch } from './apiFetch'

type DisableTwoFactorPayload = {
  password: string
  code: string
}

type DisableTwoFactorResponse = {
  disabled: boolean
}

export async function disableTwoFactor(
  payload: DisableTwoFactorPayload,
  accessToken: string
): Promise<DisableTwoFactorResponse> {
  const response = await apiFetch(`${API}/auth/2fa/disable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data && typeof data === 'object' && 'message' in data
        ? String(data.message)
        : 'Failed to disable 2FA'
    )
  }

  return data as DisableTwoFactorResponse
}