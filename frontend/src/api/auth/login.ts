import { API } from '../config'
import { ApiError, type ApiErrorData } from './register'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken?: string
  requires2fa?: boolean
  tempToken?: string
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => ({}))) as
    LoginResponse & ApiErrorData

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data
}