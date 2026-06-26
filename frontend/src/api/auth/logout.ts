import { API } from '../config'
import { apiFetch } from './apiFetch'

export async function logoutUser(): Promise<void> {
  await apiFetch(`${API}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}