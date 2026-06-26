import type { OrderStatus } from '../../api/admin/orders'

type Props = {
  status: OrderStatus
}

const statusClasses: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-slate-100 text-slate-700',
  PAYMENT_FAILED: 'bg-red-100 text-red-700',
  PAYMENT_SUCCESSFUL: 'bg-emerald-100 text-emerald-700',
  PAYMENT_EXPIRED: 'bg-orange-100 text-orange-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCEL_REQUESTED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-slate-200 text-slate-700',
  PARTIALLY_REFUNDED: 'bg-purple-100 text-purple-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  )
}