import { useState } from 'react'
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'

import { FRONT } from '../../api/config'

type CheckoutPaymentFormProps = {
  orderId: string
}

export function CheckoutPaymentForm({
  orderId,
}: CheckoutPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [error, setError] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!stripe || !elements || isPaying) return

    try {
      setIsPaying(true)
      setError('')

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${FRONT}/order-confirmation/${orderId}`,
        },
        redirect: 'if_required',
      })

      if (result.error) {
        sessionStorage.setItem(
          `payment_error_${orderId}`,
          result.error.message ?? 'Payment failed.',
        )

        if (result.error) {
          setError(result.error.message ?? 'Payment failed. Please try again.')
          return
        }
      }

      if (result.paymentIntent?.status === 'succeeded') {
        window.location.href = `${FRONT}/order-confirmation/${orderId}`
        return
      }

      setError('Payment was not completed.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Payment failed.',
      )
    } finally {
      setIsPaying(false)
    }

  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isPaying}
        className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPaying ? 'Processing...' : 'Pay now'}
      </button>
    </form>
  )
}