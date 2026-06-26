import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Elements } from '@stripe/react-stripe-js'
import { Clock, Lock, ShieldCheck } from 'lucide-react'

import { stripePromise } from '../utils/stripe'
import { CheckoutPaymentForm } from '../components/payment/paymentElement'
import { createPaymentIntent } from '../api/payment/paymentIntent'
import { expirePayment } from '../api/payment/expirePayment'
import { BackToShoppingButton } from '../components/ui/BackToShopping'
import { NotFoundError } from '../api/errors'
import NotFoundPage from './NotFoundPage'

const PAYMENT_DURATION_MS = 30 * 60 * 1000

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!orderId) return

    const storageKey = `guest_order_expires_${orderId}`
    const existingExpiresAt = sessionStorage.getItem(storageKey)

    if (existingExpiresAt) {
      setExpiresAt(Number(existingExpiresAt))
      return
    }

    const newExpiresAt = Date.now() + PAYMENT_DURATION_MS

    sessionStorage.setItem(storageKey, String(newExpiresAt))
    setExpiresAt(newExpiresAt)
  }, [orderId])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const remainingMs = expiresAt
    ? Math.max(expiresAt - now, 0)
    : PAYMENT_DURATION_MS

  const remainingTime = useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [remainingMs])

  useEffect(() => {
    if (!orderId || !expiresAt) return

    async function loadPaymentIntent() {
      if (!expiresAt) return
      if (expiresAt <= Date.now()) {
        setError(new Error('Payment time expired. Please create a new order.'))
        setIsLoading(false)
        sessionStorage.removeItem('pending_payment')
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const guestToken = sessionStorage.getItem(`guest_order_${orderId}`)

        if (!orderId) return

        const result = await createPaymentIntent({
          orderId,
          guestToken: guestToken ?? undefined,
        })

        setClientSecret(result.clientSecret)
      } catch (err) {
        const apiError =
          err instanceof Error ? err : new Error('Failed to prepare payment.')

        if (apiError.message.includes('Payment was already completed')) {
          sessionStorage.removeItem('pending_payment')
          sessionStorage.removeItem(`guest_order_expires_${orderId}`)

          navigate(`/order-confirmation/${orderId}`)
          return
        }

        setError(apiError)
      } finally {
        setIsLoading(false)
      }
    }

    loadPaymentIntent()
  }, [orderId, expiresAt])

  useEffect(() => {
    if (!orderId || !expiresAt) return

    if (remainingMs > 0) return

    async function expireCurrentPayment() {
      try {

        console.log('Timer expired')
        console.log('Calling expirePayment', orderId)
        const guestToken = sessionStorage.getItem(`guest_order_${orderId}`)

        if (!orderId) return
        await expirePayment(orderId, guestToken ?? undefined)
        console.log('expirePayment success')
        sessionStorage.removeItem('pending_payment')
      } catch (err) {
        console.error('Failed to expire payment:', err)
      } finally {
        setClientSecret(null)
        setError(new Error('Payment time expired. Please create a new order.'))
        sessionStorage.removeItem('pending_payment')
        setIsLoading(false)

        sessionStorage.removeItem(`guest_order_expires_${orderId}`)
      }
    }

    expireCurrentPayment()
  }, [orderId, expiresAt, remainingMs])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <BackToShoppingButton />
          <p className="text-zinc-600">Preparing secure payment...</p>
        </div>
      </main>
    )
  }

  if (error instanceof NotFoundError) {
  return (
    <NotFoundPage
      title="Order not found"
      message="This payment link is invalid or the order no longer exists."
    />
  )
}

  if (error || !clientSecret || remainingMs <= 0) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <BackToShoppingButton />
          <h1 className="text-2xl font-bold text-zinc-900">
            Payment unavailable
          </h1>

          <p className="mt-3 text-zinc-600">
            {error?.message}
          </p>

          <button
            onClick={() => navigate('/cart')}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Back to cart
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="p-6 sm:p-8">
            <BackToShoppingButton />

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <Lock size={14} />
                  Secure checkout
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-950">
                  Complete your payment
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
                  Your order is safely reserved while the countdown is active.
                  Finish payment to confirm your purchase.
                </p>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-4 text-white shadow-lg shadow-emerald-200">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-50">
                  <Clock size={14} />
                  Time remaining
                </div>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {remainingTime}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-white/50 bg-white/80 p-4 shadow-inner backdrop-blur sm:p-6">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: 'en',
                  appearance: {
                    theme: 'stripe',
                    labels: 'floating',
                    variables: {
                      colorPrimary: '#059669',
                      colorBackground: '#ffffff',
                      colorText: '#18181b',
                      colorDanger: '#dc2626',
                      borderRadius: '18px',
                      spacingUnit: '6px',
                      fontFamily:
                        'Inter, ui-sans-serif, system-ui, sans-serif',
                    },
                  },
                }}
              >
                <CheckoutPaymentForm orderId={orderId!} />
              </Elements>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-zinc-950">
                  Protected payment
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  All payment information is encrypted and securely processed by
                  Stripe.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                <Lock size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-zinc-950">
                  Your items are reserved
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  We temporarily reserve your products while payment is being
                  completed.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}