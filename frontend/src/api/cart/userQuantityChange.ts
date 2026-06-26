import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export async function updateUserCartQuantity(skuId: string, quantity: number) {
  const response = await apiFetch(`${API}/cart/items/sku/${skuId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  })

  if (!response.ok) {
    throw new Error('Could not update cart quantity')
  }

  return response.json()
}