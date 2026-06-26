import { API } from '../config'
import { apiFetch } from '../auth/apiFetch'
import type { Order } from '../../types/order'

export type OrderFilters = {
    status?: string
    from?: string
    to?: string
}

export async function getMyOrders(
    filters: OrderFilters = {},
) {
    const params = new URLSearchParams()

    if (filters.status) {
        params.set('status', filters.status)
    }

    if (filters.from) {
        params.set('from', filters.from)
    }

    if (filters.to) {
        params.set('to', filters.to)
    }

    const query = params.toString()

    const res = await apiFetch(
        query
            ? `${API}/orders/me?${query}`
            : `${API}/orders/me`,
    )

    if (!res.ok) {
        throw new Error('Failed to load orders')
    }

    return res.json() as Promise<Order[]>
}