import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { cancelMyOrder, getMyOrder } from "../api/orders/getOrder"
import type { Order, OrderStatus } from "../types/order"
import { NotFoundError } from '../api/errors'
import NotFoundPage from "./NotFoundPage"

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAYMENT_FAILED: "Payment failed",
  PAYMENT_SUCCESSFUL: "Paid",
  PAYMENT_EXPIRED: "Payment expired",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCEL_REQUESTED: "Cancel requested",
  CANCELLED: "Cancelled",
  PARTIALLY_REFUNDED: "Partially refunded",
  REFUNDED: "Refunded",
}

function formatMoney(cents?: number) {
  return `€${((cents ?? 0) / 100).toFixed(2)}`
}

function canCancelOrder(status: OrderStatus) {
  return [
    "PAYMENT_SUCCESSFUL",
    "PROCESSING",
    "PENDING_PAYMENT",
  ].includes(status)
}

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return

      try {
        setError(null)
        const data = await getMyOrder(orderId)
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load order"))
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  async function handleCancelOrder() {
    if (!order) {
      return
    }

    try {
      setIsCancelling(true)
      setError(null)

      const updatedOrder = await cancelMyOrder(order.id)

      setOrder(updatedOrder)
      setShowCancelModal(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to cancel order"))
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return <p className="p-6">Loading order...</p>
  }

  if (error instanceof NotFoundError) {
    return (
      <NotFoundPage
        title="Order not found"
        message="This order does not exist or you no longer have access to it."
      />
    )
  }

  if (error && !order) {
    return <p className="p-6 text-red-600">{error.message}</p>
  }

  if (!order) {
    return <p className="p-6">Order not found.</p>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/orders"
          className="inline-flex rounded-2xl px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-white/60 hover:text-zinc-950"
        >
          ← Back to orders
        </Link>

        <div className="mt-6 rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Order details
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                Order #{order.id}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Created:{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                {ORDER_STATUS_LABELS[order.status]}
              </span>

              {canCancelOrder(order.status) && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isCancelling}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCancelling ? "Cancelling..." : "Cancel this order"}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error.message}
            </div>
          )}

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Items
                </h2>

                <div className="mt-4 divide-y divide-zinc-100">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="font-medium text-zinc-950">
                          {item.productName ?? "Product"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold text-zinc-950">
                        {formatMoney(item.lineTotalCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Order history
                </h2>

                <div className="mt-5 space-y-5">
                  {order.orderStatusHistory?.length ? (
                    order.orderStatusHistory.map((event) => (
                      <div
                        key={event.id}
                        className="relative border-l-2 border-emerald-200 pl-5"
                      >
                        <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />

                        <p className="text-sm font-semibold text-zinc-950">
                          {ORDER_STATUS_LABELS[event.status]}
                        </p>

                        {event.note && (
                          <p className="mt-1 text-sm text-zinc-600">
                            {event.note}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-zinc-400">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No history available yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Summary
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium text-zinc-900">
                      {formatMoney(order.subtotalCents)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="font-medium text-zinc-900">
                      {formatMoney(order.shippingCents)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-zinc-100 pt-4 text-base font-bold text-zinc-950">
                    <span>Total</span>
                    <span>{formatMoney(order.totalCents)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Delivery method
                </h2>

                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm">
                  <p className="font-semibold text-zinc-950">
                    {order.shippingMethod?.name}
                  </p>

                  <p className="mt-1 text-emerald-700">
                    {formatMoney(order.shippingMethod?.priceCents)}
                  </p>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                  Cancel order?
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Are you sure you want to request cancellation for this order?
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Refunds will be reviewed depending on the order status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Keep order
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling
                  ? "Cancelling..."
                  : "Yes, cancel order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}