import { apiFetch } from '../auth/apiFetch'
import { getGuestCart, clearGuestCart } from '../../components/cart/cartStorage'
import { API } from '../config'

export async function mergeGuestCart() {
  const items = getGuestCart()

  if (items.length === 0) return

  const response = await apiFetch(`${API}/cart/merge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!response.ok) {
    throw new Error('Could not merge guest cart')
  }

  clearGuestCart()
  window.dispatchEvent(new Event('cart-updated'))

  return response.json()
}