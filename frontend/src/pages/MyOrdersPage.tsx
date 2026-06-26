import { useEffect, useState } from 'react'
import { getMyOrders } from '../api/orders/getMyOrders'
import { OrderCard } from '../components/orders/OrderCard'
import type { Order } from '../types/order'
import { BackToShoppingButton } from '../components/ui/BackToShopping'

export function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [status, setStatus] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadOrders() {
            try {
                setIsLoading(true)
                setError('')

                const result = await getMyOrders({
                    status: status || undefined,
                    from: from || undefined,
                    to: to || undefined,
                })

                setOrders(result)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load orders.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadOrders()
    }, [status, from, to])

    return (
  <main className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 px-4 py-10 text-zinc-900">
    <div className="mx-auto max-w-5xl">
      <BackToShoppingButton />

      <div className="mt-6 rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Order history
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
              My orders
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Track your payments, deliveries, cancellations and refunds.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-inner backdrop-blur sm:grid-cols-3">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">All statuses</option>
            <option value="PENDING_PAYMENT">Pending payment</option>
            <option value="PAYMENT_FAILED">Payment failed</option>
            <option value="PAYMENT_EXPIRED">Payment expired</option>
            <option value="PAYMENT_SUCCESSFUL">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCEL_REQUESTED">Cancel requested</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PARTIALLY_REFUNDED">Partially refunded</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />

          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        {isLoading && (
          <div className="mt-8 rounded-2xl border border-white/70 bg-white/70 p-5 text-sm text-zinc-500">
            Loading orders...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/70 bg-white/70 p-6 text-center">
            <p className="font-semibold text-zinc-900">
              No orders yet
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Once you place an order, it will appear here.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  </main>
)
}