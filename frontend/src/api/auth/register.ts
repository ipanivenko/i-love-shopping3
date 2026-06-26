import { API } from "../config"

export type RegisterInput = {
  name: string
  email: string
  password: string
  confirmPassword: string
  captchaToken: string
}

export type RegisterResponse = {
  ok?: boolean
  message?: string
}

export type ApiErrorData = {
  message?: string
  code?: string
  setupRoute?: string
  email?: string
  canContinueWithGoogle?: boolean
  needsName?: boolean
  needsPassword?: boolean
}

export class ApiError extends Error {
  status: number
  data: ApiErrorData

  constructor(status: number, data: ApiErrorData) {
    super(data.message || "Request failed")
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  })

  const data = (await res.json().catch(() => ({}))) as RegisterResponse & ApiErrorData

  if (!res.ok) {
    throw new ApiError(res.status, data)
  }

  return data
}