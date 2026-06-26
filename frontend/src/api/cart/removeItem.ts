import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export async function removeFromUserCart(skuId: string) {
  const response = await apiFetch(`${API}/cart/items/${skuId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Could not remove item from cart')
  }
}