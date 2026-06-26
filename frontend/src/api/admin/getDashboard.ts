import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export async function getAdminDashboard() {
  const response = await apiFetch(`${API}/admin/dashboard`, {
    method: 'GET',
  })

  return response.json()
}