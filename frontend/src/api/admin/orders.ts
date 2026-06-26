import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_SUCCESSFUL'
  | 'PAYMENT_EXPIRED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'

export type AdminOrderItem = {
  id: string
  productName: string
  brandName?: string | null
  imageUrl?: string | null
  skuLabel?: string | null
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export type AdminOrder = {
  id: string
  status: OrderStatus
  currency: string
  subtotalCents: number
  shippingCents: number
  totalCents: number
  createdAt: string
  paidAt?: string | null
  customerInfo?: {
    email: string
    name?: string | null
  } | null
  shippingAddress?: {
    fullName: string
    phone?: string | null
    address: string
    city: string
    postcode: string
    country: string
  } | null
  shippingMethod?: {
    name: string
    code: string
    priceCents: number
  } | null
  items: AdminOrderItem[]
  orderStatusHistory?: {
    id: string
    status: OrderStatus
    note?: string | null
    createdAt: string
  }[]
}

export type UpdateOrderStatusDto = {
  status: OrderStatus
  note?: string
}

export type RejectCancellationDto = {
  note?: string
}

export async function getAdminOrders() {
  const response = await apiFetch(`${API}/admin/orders`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? 'Failed to load orders')
  }

  return response.json() as Promise<AdminOrder[]>
}

export async function getAdminOrder(id: string) {
  const response = await apiFetch(`${API}/admin/orders/${id}`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? 'Failed to load orders')
  }
  
  return response.json() as Promise<AdminOrder>
}

export async function updateAdminOrderStatus(
  id: string,
  data: UpdateOrderStatusDto,
) {
  const response = await apiFetch(`${API}/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AdminOrder>
}

export async function approveAdminOrderCancellation(id: string, note?: string) {
  const response = await apiFetch(`${API}/admin/orders/${id}/cancellation/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note }),
  })

  return response.json() as Promise<AdminOrder>
}

export async function rejectAdminOrderCancellation(
  id: string,
  data: RejectCancellationDto,
) {
  const response = await apiFetch(`${API}/admin/orders/${id}/cancellation/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json() as Promise<AdminOrder>
}