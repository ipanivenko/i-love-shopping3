import { API } from '../config'
import { apiFetch } from '../auth/apiFetch'
import type { Order } from '../../types/order'
import { NotFoundError } from '../errors'


export async function getMyOrder(orderId: string) {
  const res = await apiFetch(`${API}/orders/me/${orderId}`)

  if (res.status === 404) {
    throw new NotFoundError('Order not found')
  }

  if (!res.ok) {
    throw new Error('Failed to load order')
  }

  return res.json()
}

export async function cancelMyOrder(orderId: string): Promise<Order> {
  const response = await apiFetch(`${API}/orders/me/${orderId}/cancel`, {
    method: "PATCH",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? 'Failed to cancel order')
  }

  return response.json()
}


export async function getGuestOrder(orderId: string, guestToken: string) {
  const res = await fetch(`${API}/orders/${orderId}`, {
    headers: {
      'x-guest-token': guestToken,
    },
  })

  if (res.status === 404) {
    throw new NotFoundError('Order not found')
  }

  if (!res.ok) {
    throw new Error('Failed to load guest order')
  }

  return res.json()
}