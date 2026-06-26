import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export async function addToUserCart(skuId: string, quantity: number) {
  return apiFetch(`${API}/cart/items`, {
    method: "POST",
    body: JSON.stringify({skuId, quantity}),
    headers: {
      "Content-Type": "application/json",
    },
  })
}