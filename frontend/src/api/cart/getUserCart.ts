import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export async function getUserCart() {
  const res = await apiFetch(`${API}/cart`, {
    method: "GET",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch user cart")
  }

  return res.json()
}