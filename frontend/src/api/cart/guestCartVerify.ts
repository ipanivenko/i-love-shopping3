import { API } from '../config'
import type { LocalCartItem } from '../../types/cart'
import type { CartPreviewResponse } from '@app/shared/cart'

export async function previewCart(
  items: LocalCartItem[]
): Promise<CartPreviewResponse> {
  const response = await fetch(`${API}/cart/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!response.ok) {
    throw new Error('Failed to preview cart')
  }

  return response.json()
}