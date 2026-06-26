import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export type AdminProduct = {
  id: string
  name: string
  slug: string
  description: string
  status: ProductStatus
  priceCents: number
  currency: string
  gender?: string | null
  surface?: string | null
  weightGrams?: number | null
  weightOunces?: number | null
  lengthMm?: number | null
  widthMm?: number | null
  heightMm?: number | null
  lengthIn?: number | string | null
  widthIn?: number | string | null
  heightIn?: number | string | null
  brand: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
  }
  createdAt: string
}

export type CreateAdminProductDto = {
  name: string
  description: string
  priceCents: number
  categoryId: string
  brandId: string
  status?: ProductStatus
}

export type UpdateAdminProductDto = Partial<CreateAdminProductDto>

export async function getAdminProducts() {
  const response = await apiFetch(`${API}/admin/products`)

  return response.json() as Promise<AdminProduct[]>
}

export async function createAdminProduct(data: CreateAdminProductDto) {
  const response = await apiFetch(`${API}/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AdminProduct>
}

export async function updateAdminProduct(
  id: string,
  data: UpdateAdminProductDto,
) {
  console.log('API update id:', id)
  console.log('API update data:', data)
  const response = await apiFetch(`${API}/admin/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message ?? 'Failed to update product')
  }

  return response.json() as Promise<AdminProduct>
}

export async function deleteAdminProduct(id: string) {
  const response = await apiFetch(`${API}/admin/products/${id}`, {
    method: 'DELETE',
  })

  return response.json() as Promise<AdminProduct>
}