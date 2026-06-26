import { API } from "../config"
import { apiFetch } from "../auth/apiFetch"


export async function validateAddress(input: {
  address: string
  city: string
  postcode: string
  country: string
}) {
  const res = await apiFetch(`${API}/checkout/validate-address`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = await res.json()

  if (!res.ok) {
    console.log('Address validation error:', data)
    throw new Error(data.message?.[0] ?? 'Failed to validate address')
  }

  return data as {
    valid: boolean
    message: string
    suggestion?: string
  }
}