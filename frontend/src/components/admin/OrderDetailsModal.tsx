import type { AdminOrder } from '../../api/admin/orders'
import { OrderStatusBadge } from './OrderStatusBadge'

type Props = {
  order: AdminOrder
  onClose: () => void
}

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(priceCents / 100)
}

export function OrderDetailsModal({ order, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Order details</h2>
            <p className="text-sm text-slate-500">{order.id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-500">Status</p>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Customer</p>
            <p className="mt-2 font-medium">{order.customerInfo?.name ?? 'Guest'}</p>
            <p className="text-sm text-slate-500">{order.customerInfo?.email}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Total</p>
            <p className="mt-2 text-lg font-bold">
              {formatPrice(order.totalCents, order.currency)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 px-4 py-3 font-semibold">
            Items
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                )}

                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-slate-500">
                    {item.brandName} {item.skuLabel ? `• ${item.skuLabel}` : ''}
                  </p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>

                <p className="font-semibold">
                  {formatPrice(item.lineTotalCents, order.currency)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {order.shippingAddress && (
          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 font-semibold">Shipping address</p>
            <p>{order.shippingAddress.fullName}</p>
            <p className="text-sm text-slate-500">
              {order.shippingAddress.address}, {order.shippingAddress.postcode}{' '}
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}