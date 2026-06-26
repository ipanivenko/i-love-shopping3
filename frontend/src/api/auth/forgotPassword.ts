import { API } from "../config"

export type ForgotPasswordInput = {
  email: string
}

export type ForgotPasswordResponse = {
  ok: boolean
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${API}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = (await response.json().catch(() => null)) as
    | ForgotPasswordResponse
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
        : 'Failed to send reset email'

    throw new Error(message)
  }

  if (!data || typeof data !== 'object' || !('ok' in data)) {
    throw new Error('Invalid forgot password response')
  }

  return data
}