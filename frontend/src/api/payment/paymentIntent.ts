import { apiFetch } from '../auth/apiFetch'
import { API } from '../config'
import { NotFoundError } from '../errors'

export async function createPaymentIntent(input: {
  orderId: string
  guestToken?: string
}) {
  const url = `${API}/payments/orders/${input.orderId}/payment-intent`

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      guestToken: input.guestToken,
    }),
  }

  const res = input.guestToken
    ? await fetch(url, {
      ...options,
      credentials: 'include',
    })
    : await apiFetch(url, options)


  if (res.status === 404) {
    throw new NotFoundError('Product not found')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    console.error('Payment intent backend error:', data)
    throw new Error(data?.message ?? 'Failed to create payment intent')
  }

  return res.json()
}