import { apiFetch } from '../auth/apiFetch'
import { API } from '../config'

export async function expirePayment(
  orderId: string,
  guestToken?: string,
) {
  const url = `${API}/payments/orders/${orderId}/expire`

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      guestToken,
    }),
  }

  const res = guestToken
    ? await fetch(url, {
        ...options,
        credentials: 'include',
      })
    : await apiFetch(url, options)

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message ?? 'Failed to expire payment')
  }

  return res.json()
}