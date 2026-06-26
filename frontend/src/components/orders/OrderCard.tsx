import { Link } from 'react-router'
import type { Order } from '../../types/order'

type Props = {
  order: Order
}

export function OrderCard({ order }: Props) {
 return (
  <div className="group rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,185,129,0.12)]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Order
        </p>

        <p className="mt-2 font-mono text-sm font-semibold text-zinc-950">
          {order.id}
        </p>

        <p className="mt-3 text-sm text-zinc-500">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : 'No date'}
        </p>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {order.status.replaceAll('_', ' ')}
        </div>

        {typeof order.totalCents === 'number' && (
          <p className="text-lg font-bold tracking-tight text-zinc-950">
            {(order.totalCents / 100).toFixed(2)} €
          </p>
        )}
      </div>
    </div>

    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-5">
      <p className="text-sm text-zinc-500">
        Track your order and payment status
      </p>

      <Link
        to={`/orders/${order.id}`}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-300"
      >
        View details
      </Link>
    </div>
  </div>
)
}