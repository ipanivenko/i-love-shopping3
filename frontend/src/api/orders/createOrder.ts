import { apiFetch } from '../auth/apiFetch'
import { API } from '../config'

type CreateOrderPayload = {
  customerInfo: {
    email: string
    name: string
  }
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    postcode: string
    country: string
  }
  shippingMethodId: string
  items: {
    skuId: string
    quantity: number
  }[]
}

export type CreateOrderResponse = {
  order: {
    id: string
    status: string
    totalCents: number
    paymentExpiresAt: Date
  }
  guestToken?: string
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  const res = await apiFetch(`${API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)

    console.log('Create order error:', errorBody)

    throw new Error(
      errorBody?.message?.join?.(', ') ??
        errorBody?.message ??
        'Failed to create order',
    )
  }

  return res.json()
}