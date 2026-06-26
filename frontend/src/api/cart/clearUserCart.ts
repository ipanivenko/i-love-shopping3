import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export async function clearUserCart() {
  const res = await apiFetch(`${API}/cart`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Failed to clear user cart")
  }
}