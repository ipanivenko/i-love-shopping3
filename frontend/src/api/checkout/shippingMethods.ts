import { API } from "../config"
import { apiFetch } from "../auth/apiFetch"

export type ShippingMethod = {
  id: string
  name: string
  description: string
  priceCents: number
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const res = await apiFetch(`${API}/shipping-methods`)

  if (!res.ok) {
    throw new Error('Failed to load shipping methods')
  }

  const data = await res.json()

  return data.methods ?? []
}