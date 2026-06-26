import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type DeliveryProfile = {
  fullName: string
  phone: string
  address: string
  city: string
  postcode: string
  country: string
}

export type CheckoutPrefill = DeliveryProfile & {
  email: string
}

export async function getCheckoutPrefill(): Promise<CheckoutPrefill> {
  const res = await apiFetch(`${API}/checkout/prefill`)

  if (!res.ok) {
    throw new Error('Failed to load checkout prefill')
  }

  const data = await res.json()

  return {
    email:data.profile?.email ?? '',
    fullName: data.profile?.fullName ?? '',
    phone: data.profile?.phone ?? '',
    address: data.profile?.address ?? '',
    city: data.profile?.city ?? '',
    postcode: data.profile?.postcode ?? '',
    country: data.profile?.country ?? '',
  }
}

export async function updateCheckoutProfile(
  profile: DeliveryProfile,
): Promise<DeliveryProfile> {
  const res = await apiFetch(`${API}/checkout/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  })

  if (!res.ok) {
  const errorBody = await res.json().catch(() => null)
  console.log('CHECKOUT PROFILE ERROR:', errorBody)
  throw new Error('Failed to save checkout profile')
  }

  const data = await res.json()

  return {
    fullName: data.profile?.fullName ?? '',
    phone: data.profile?.phone ?? '',
    address: data.profile?.address ?? '',
    city: data.profile?.city ?? '',
    postcode: data.profile?.postcode ?? '',
    country: data.profile?.country ?? '',
  }
}