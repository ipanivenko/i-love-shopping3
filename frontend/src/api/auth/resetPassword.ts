import { API } from '../config'

export type ResetPasswordInput = {
  rid: string
  token: string
  newPassword: string
}

export type ResetPasswordResponse = {
  ok: boolean
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<ResetPasswordResponse> {
  const response = await fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = (await response.json().catch(() => null)) as
    | ResetPasswordResponse
    | { message?: string | string[] }
    | null

  if (!response.ok) {
    const message =
      data &&
      typeof data === 'object' &&
      'message' in data &&
      data.message
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message
        : 'Failed to reset password'

    throw new Error(message)
  }

  if (!data || typeof data !== 'object' || !('ok' in data)) {
    throw new Error('Invalid reset password response')
  }

  return data
}