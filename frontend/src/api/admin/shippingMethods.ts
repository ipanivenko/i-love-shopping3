import { apiFetch } from "../auth/apiFetch"
import { API } from '../config'

export type ShippingMethod = {
    id: string
    name: string
    code: string
    description?: string | null
    priceCents: number
    currency: string
    estimatedDaysMin?: number | null
    estimatedDaysMax?: number | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type ShippingMethodPayload = {
  name: string
  code: string
  description?: string
  priceCents: number
  currency: string
  estimatedDaysMin?: number | null
  estimatedDaysMax?: number | null
  isActive: boolean
}

export type CreateShippingMethodDto = {
    name: string
    code: string
    description?: string
    priceCents: number
    currency: string
    estimatedDaysMin?: number | null
    estimatedDaysMax?: number | null
    isActive?: boolean
}

export type UpdateShippingMethodDto = Partial<CreateShippingMethodDto>

export async function getAdminShippingMethods() {
    const response = await apiFetch(`${API}/admin/shipping-methods`)

    return response.json() as Promise<ShippingMethod[]>
}

export async function createAdminShippingMethod(
    data: CreateShippingMethodDto,
) {
    const response = await apiFetch(`${API}/admin/shipping-methods`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    return response.json() as Promise<ShippingMethod>
}

export async function updateAdminShippingMethod(
    id: string,
    data: UpdateShippingMethodDto,
) {
    const response = await apiFetch(
        `${API}/admin/shipping-methods/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        },
    )

    return response.json() as Promise<ShippingMethod>
}

export async function deleteAdminShippingMethod(id: string) {
    const response = await apiFetch(
        `${API}/admin/shipping-methods/${id}`,
        {
            method: 'DELETE',
        },
    )

    return response.json()
}