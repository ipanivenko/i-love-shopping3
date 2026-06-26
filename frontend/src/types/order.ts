export const OrderStatus = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAYMENT_SUCCESSFUL',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCEL_REQUESTED: 'CANCEL_REQUESTED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED',
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
    PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
    PAYMENT_FAILED: 'PAYMENT_FAILED'
} as const

export type OrderStatus =
    (typeof OrderStatus)[keyof typeof OrderStatus]

export type OrderItem = {
    id: string

    quantity: number

    unitPriceCents: number
    lineTotalCents?: number

    productName?: string

    sku?: {
        id: string

        color?: {
            name: string

            product?: {
                id: string
                name: string
                slug: string
            }

            images?: {
                url: string
            }[]
        }
    }
}

export type ShippingMethodDetails = {
  id: string
  name: string
  code: string
  estimatedDaysMin: number | null
  estimatedDaysMax: number | null
}

export type ShippingMethod = {
    id: string
    name: string
    priceCents: number
    shippingMethod?: ShippingMethodDetails | null
}

export type OrderStatusHistoryItem = {
    id: string
    status: OrderStatus
    note?: string | null
    createdAt: string
}

export type Order = {
    id: string
    status: OrderStatus
    subtotalCents?: number
    shippingCents?: number
    totalCents?: number
    createdAt?: string
    shippingMethod?: ShippingMethod | null
    items?: OrderItem[]
    orderStatusHistory?: OrderStatusHistoryItem[]
}