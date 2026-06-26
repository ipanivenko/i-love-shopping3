import { API } from '../config'
import { apiFetch } from './apiFetch'

export type SetupTwoFactorResponse = {
  qrDataUrl: string
  manualSecret: string
  issuer: string
  label: string
}

export async function setupTwoFactor(accessToken?: string) {
  const response = await apiFetch(`${API}/auth/2fa/setup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  })

  const data = (await response.json().catch(() => null)) as
    | SetupTwoFactorResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const errorMessage =
      data && typeof data === 'object' && 'message' in data
        ? data.message
        : 'Failed to start 2FA setup'

    throw new Error(String(errorMessage))
  }

  if (!data || !('qrDataUrl' in data) || !('manualSecret' in data)) {
    throw new Error('Invalid 2FA setup response')
  }

  return data
}