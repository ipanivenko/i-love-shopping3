import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type AdminBrand = {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'ARCHIVED'
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'ARCHIVED'
  parentId?: string | null
  parent?: {
    id: string
    name: string
    slug: string
  } | null
}

export async function getAdminBrands() {
  const response = await apiFetch(`${API}/admin/brands`)
  return response.json() as Promise<AdminBrand[]>
}

export async function createAdminBrand(data: { name: string }) {
  const response = await apiFetch(`${API}/admin/brands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AdminBrand>
}

export async function updateAdminBrand(
  id: string,
  data: {
    name: string
  },
) {
  const response = await apiFetch(`${API}/admin/brands/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AdminBrand>
}

export async function archiveAdminBrand(id: string) {
  const response = await apiFetch(
    `${API}/admin/brands/${id}/archive`,
    {
      method: 'PATCH',
    },
  )

  return response.json() as Promise<AdminBrand>
}

export async function restoreAdminBrand(id: string) {
  const response = await apiFetch(
    `${API}/admin/brands/${id}/restore`,
    {
      method: 'PATCH',
    },
  )

  return response.json() as Promise<AdminBrand>
}

export async function getAdminCategories() {
  const response = await apiFetch(`${API}/admin/categories`)
  return response.json() as Promise<AdminCategory[]>
}

export async function createAdminCategory(data: {
  name: string
  parentId?: string
}) {
  const response = await apiFetch(`${API}/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AdminCategory>
}

export async function updateAdminCategory(
  id: string,
  data: {
    name: string
    parentId?: string
  },
) {
  const response = await apiFetch(`${API}/admin/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AdminCategory>
}

export async function archiveAdminCategory(id: string) {
  const response = await apiFetch(
    `${API}/admin/categories/${id}/archive`,
    {
      method: 'PATCH',
    },
  )

  return response.json() as Promise<AdminCategory>
}

export async function restoreAdminCategory(id: string) {
  const response = await apiFetch(
    `${API}/admin/categories/${id}/restore`,
    {
      method: 'PATCH',
    },
  )

  return response.json() as Promise<AdminCategory>
}