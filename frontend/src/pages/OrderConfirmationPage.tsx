import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { getGuestOrder, getMyOrder } from '../api/orders/getOrder'
import { clearGuestCart } from '../components/cart/cartStorage'
import { useAuth } from '../context/AuthContext'
import type { Order } from '../types/order'
import { NotFoundError } from '../api/errors'
import NotFoundPage from './NotFoundPage'


export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, isAuthLoading } = useAuth()

  useEffect(() => {
    if (isAuthLoading) return

    async function loadOrder() {
      if (!orderId) {
        setError(new Error('Missing order id.'))
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const guestToken = sessionStorage.getItem(`guest_order_${orderId}`)

        let result

        if (guestToken) {
          result = await getGuestOrder(orderId, guestToken)
        } else {
          if (!isAuthenticated) {
            setError(new Error('You must be logged in to view this order.'))
            return
          }

          result = await getMyOrder(orderId)
        }

        setOrder(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to load order.'),
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId, isAuthLoading, isAuthenticated])

  useEffect(() => {
    if (order?.status !== 'PAYMENT_SUCCESSFUL') return

    clearGuestCart()

    if (orderId) {
      sessionStorage.removeItem(`guest_order_${orderId}`)
      sessionStorage.removeItem(`guest_order_expires_${orderId}`)
      sessionStorage.removeItem('pending_payment')
    }

    window.dispatchEvent(new Event('cart-updated'))
  }, [order?.status, orderId])

  function addDays(date: Date, days: number) {
    const copy = new Date(date)
    copy.setDate(copy.getDate() + days)
    return copy
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  function getEstimatedDelivery(order: Order) {
    const minDays =
      order.shippingMethod?.shippingMethod?.estimatedDaysMin

    const maxDays =
      order.shippingMethod?.shippingMethod?.estimatedDaysMax

    if (minDays == null || maxDays == null) {
      return 'Estimated delivery unavailable'
    }

    const today = new Date()

    return `${formatDate(addDays(today, minDays))} - ${formatDate(addDays(today, maxDays))}`
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-zinc-600">Checking payment status...</p>
        </div>
      </main>
    )
  }

  if (error instanceof NotFoundError) {
  return (
    <NotFoundPage
      title="Order not found"
      message="This order does not exist or you no longer have access to it."
    />
  )
}

  if (error || !order) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto text-red-600" size={48} />

          <h1 className="mt-4 text-2xl font-bold text-zinc-950">
            Order not found
          </h1>

          <p className="mt-2 text-zinc-600">
            {error?.message}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Back home
          </Link>
        </div>
      </main>
    )
  }

  const isPaid = order.status === 'PAYMENT_SUCCESSFUL'
  const isFailed = order.status === 'PAYMENT_FAILED'
  const isPending = order.status === 'PENDING_PAYMENT'
  const estimatedDelivery = getEstimatedDelivery(order)

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 px-4 py-16 text-zinc-900">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 text-center shadow-xl shadow-emerald-900/10 backdrop-blur">
        {isPaid && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-inner">
              <CheckCircle className="text-emerald-600" size={52} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-zinc-950">
              Payment successful
            </h1>

            <p className="mt-3 text-zinc-600">
              Thank you. Your order has been confirmed.
            </p>
          </>
        )}

        {isPending && (
          <>
            <Clock className="mx-auto text-amber-600" size={56} />

            <h1 className="mt-5 text-3xl font-bold text-zinc-950">
              Payment status is being updated
            </h1>

            <p className="mt-3 text-zinc-600">
              Your payment result is being processed. Refresh this page in a few seconds.
            </p>

            <Link
              to={`/payment/${order.id}`}
              className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Back to payment
            </Link>
          </>
        )}

        {isFailed && (
          <>
            <XCircle className="mx-auto text-red-600" size={56} />

            <h1 className="mt-5 text-3xl font-bold text-zinc-950">
              Payment failed
            </h1>

            <p className="mt-3 text-zinc-600">
              Your payment could not be completed. You can try again.
            </p>
          </>
        )}

        {!isPaid && !isPending && !isFailed && (
          <>
            <Clock className="mx-auto text-zinc-500" size={56} />

            <h1 className="mt-5 text-3xl font-bold text-zinc-950">
              Order status: {order.status}
            </h1>
          </>
        )}

        <div className="mt-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 p-5 text-left shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">
            Order summary
          </h2>

          <p className="mt-4 text-sm text-zinc-500">Reference number</p>
          <p className="mt-1 font-mono text-sm font-semibold text-zinc-900">
            {order.id}
          </p>

          <p className="mt-4 text-sm text-zinc-500">Status</p>
          <p className="mt-1 font-semibold text-zinc-900">
            {order.status}
          </p>

          <p className="mt-4 text-sm text-zinc-500">Estimated delivery</p>
          <p className="mt-1 font-semibold text-zinc-900">
            {estimatedDelivery}
          </p>

          {typeof order.totalCents === 'number' && (
            <>
              <p className="mt-4 text-sm text-zinc-500">Total</p>
              <p className="mt-1 font-semibold text-zinc-900">
                {(order.totalCents / 100).toFixed(2)} €
              </p>
            </>
          )}

          {order.shippingMethod && (
            <>
              <p className="mt-4 text-sm text-zinc-500">Shipping method</p>
              <p className="mt-1 font-semibold text-zinc-900">
                {order.shippingMethod.name}
              </p>
            </>
          )}

          {(order.items?.length ?? 0) > 0 && (
            <>
              <p className="mt-4 text-sm text-zinc-500">Items</p>

              <div className="mt-2 space-y-2">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-zinc-700">
                      {(item.productName ??
                        item.sku?.color?.product?.name ??
                        'Product')}{' '}
                      × {item.quantity}
                    </span>

                    <span className="font-medium text-zinc-900">
                      {(
                        (item.lineTotalCents ??
                          item.unitPriceCents * item.quantity) / 100
                      ).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isFailed && (
            <Link
              to={`/payment/${order.id}`}
              className="rounded-2xl border border-emerald-200 bg-white/70 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Try payment again
            </Link>
          )}

          <Link
            to="/"
            className="rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  )
}