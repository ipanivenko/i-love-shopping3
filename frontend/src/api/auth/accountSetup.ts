import { API } from '../config'
import { ApiError, type ApiErrorData } from './register'
import { apiFetch } from './apiFetch'

export type AccountSetupInput = {
  name?: string
  password?: string
  confirmPassword?: string
}

export type AccountSetupResponse = {
  message: string
}

export async function accountSetup(
  input: AccountSetupInput
): Promise<AccountSetupResponse> {
  const res = await apiFetch(`${API}/auth/setup-account`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  const data = (await res.json().catch(() => ({}))) as
    AccountSetupResponse & ApiErrorData

  if (!res.ok) {
    throw new ApiError(res.status, data)
  }

  return data
}