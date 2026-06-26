import { API } from "../config"
import { apiFetch } from "./apiFetch"


export async function getMe() {
  const response = await apiFetch(`${API}/auth/me`, {
    method: 'GET',
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      (data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof data.message === 'string' &&
        data.message) ||
        'Failed to fetch current user'
    )
  }

  return data
}