import { useEffect, useState } from 'react'
import { CheckoutStep } from '../components/checkout/CheckoutStep'
import { ContactInfoStep } from '../components/checkout/ContactInfoStep'
import { AddressStep } from '../components/checkout/AddressStep'
import { ShippingStep } from '../components/checkout/ShippingMethodsStep'
import { CheckoutOrderSummary } from '../components/checkout/SummaryStep'
import { getCheckoutPrefill } from '../api/checkout/deliveryProfile'
import { useAuth } from '../context/AuthContext'
import type { CartPreviewResponse } from '@app/shared/cart'
import { previewCart } from '../api/cart/guestCartVerify'
import { getUserCart } from '../api/cart/getUserCart'
import { PaymentStep } from '../components/checkout/PaymentStep'
import { useNavigate } from 'react-router'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { createOrder } from '../api/orders/createOrder'

import {
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  recalculateGuestCart,
  removeItemFromCartState,
} from '../components/cart/cartStorage'

type CheckoutForm = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postcode: string
  country: string
  shippingMethodId: string
  paymentMethod: string
}

const emptyCheckoutForm: CheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postcode: '',
  country: '',
  shippingMethodId: '',
  paymentMethod: '',
}

export default function CheckoutPage() {
  const { isAuthLoading, isAuthenticated } = useAuth()

  const [form, setForm] = useState<CheckoutForm>(emptyCheckoutForm)
  const [openSteps, setOpenSteps] = useState<number[]>([1])
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(true)

  const [cart, setCart] = useState<CartPreviewResponse | null>(null)
  const [shippingCents, setShippingCents] = useState(0)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')

  const navigate = useNavigate()

  const isCheckoutComplete =
    completedSteps.includes(1) &&
    completedSteps.includes(2) &&
    completedSteps.includes(3) &&
    completedSteps.includes(4) &&
    cart &&
    cart.items.length > 0

  useEffect(() => {
    async function loadPrefill() {
      if (isAuthLoading) return

      if (!isAuthenticated) {
        setIsLoadingPrefill(false)
        return
      }

      try {
        const profile = await getCheckoutPrefill()

        setForm((current) => ({
          ...current,
          fullName: profile.fullName ?? '',
          email: profile.email ?? '',
          phone: profile.phone ?? '',
          address: profile.address ?? '',
          city: profile.city ?? '',
          postcode: profile.postcode ?? '',
          country: profile.country ?? '',
        }))
      } catch {
        // no prefill, keep empty form
      } finally {
        setIsLoadingPrefill(false)
      }
    }

    loadPrefill()
  }, [isAuthenticated, isAuthLoading])

  useEffect(() => {
    async function loadCart() {
      if (isAuthLoading) return

      if (isAuthenticated) {
        const userCart = await getUserCart()
        setCart(userCart)
        return
      }

      const localItems = getGuestCart()

      if (localItems.length === 0) {
        setCart({
          items: [],
          subtotalCents: 0,
          warnings: [],
        })
        return
      }

      const preview = await previewCart(localItems)
      setCart(preview)
    }

    loadCart()
  }, [isAuthenticated, isAuthLoading])

  const toggleStep = (step: number) => {
    setOpenSteps((current) =>
      current.includes(step)
        ? current.filter((item) => item !== step)
        : [...current, step],
    )
  }

  const completeStep = (step: number, nextStep: number) => {
    setCompletedSteps((current) =>
      current.includes(step) ? current : [...current, step],
    )

    setOpenSteps((current) =>
      current.includes(nextStep) ? current : [...current, nextStep],
    )
  }

  function updateForm<K extends keyof CheckoutForm>(
    field: K,
    value: CheckoutForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleShippingSelect(id: string, priceCents: number) {
    updateForm('shippingMethodId', id)
    setShippingCents(priceCents)
  }

  function handleQuantityChange(skuId: string, quantity: number) {
    if (!cart) return

    updateGuestCartQuantity(skuId, quantity)

    setCart((currentCart) => {
      if (!currentCart) return currentCart
      return recalculateGuestCart(currentCart, skuId, quantity)
    })

    window.dispatchEvent(new Event('cart-updated'))
  }

  function handleRemove(skuId: string) {
    removeFromGuestCart(skuId)

    setCart((currentCart) =>
      currentCart ? removeItemFromCartState(currentCart, skuId) : currentCart,
    )

    window.dispatchEvent(new Event('cart-updated'))
  }

  function uncompleteStep(step: number) {
    setCompletedSteps((current) => current.filter((item) => item !== step))
  }

  async function handlePlaceOrder() {
    if (!cart || cart.items.length === 0) {
      setOrderError('Your cart is empty.')
      return
    }

    if (!form.shippingMethodId) {
      setOrderError('Please choose a shipping method.')
      return
    }

    try {
      setIsPlacingOrder(true)
      setOrderError('')

      const result = await createOrder({
        customerInfo: {
          email: form.email,
          name: form.fullName,
        },
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postcode: form.postcode,
          country: form.country,
        },
        shippingMethodId: form.shippingMethodId,
        items: cart.items.map((item) => ({
          skuId: item.skuId,
          quantity: item.quantity,
        })),
      })

      if (!isAuthenticated && result.guestToken) {
        sessionStorage.setItem(
          `guest_order_${result.order.id}`,
          result.guestToken,
        )
      }

      sessionStorage.setItem(
        'pending_payment',
        JSON.stringify({
          orderId: result.order.id,
          expiresAt: new Date(result.order.paymentExpiresAt).getTime(),
        }),
      )

      navigate(`/payment/${result.order.id}`, {
        state: {
          paymentExpiresAt: result.order.paymentExpiresAt,
        },
      })
    } catch {
      setOrderError('Could not place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (isAuthLoading || isLoadingPrefill) {
    return (
      <main className="bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
          Loading checkout...
        </div>
      </main>
    )
  }

  return (
  <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-teal-100 px-4 py-10 text-zinc-900">
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/cart")}
        className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-zinc-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </button>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-emerald-900/5 backdrop-blur sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 shadow-inner">
            <ShieldCheck className="h-8 w-8 text-emerald-700" />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-zinc-950">
            Checkout
          </h1>

          <p className="mt-3 text-sm font-medium text-zinc-500">
            Review your details, choose delivery, and confirm your order.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" />
            Secure checkout · Card payment handled safely with Stripe.
          </div>
        </div>
      </div>

      <CheckoutStep
        number={1}
        title="Contact information"
        isOpen={openSteps.includes(1)}
        isCompleted={completedSteps.includes(1)}
        onToggle={() => toggleStep(1)}
      >
        <ContactInfoStep
          fullName={form.fullName}
          email={form.email}
          phone={form.phone}
          onChange={(field, value) => {
            updateForm(field, value)
            uncompleteStep(1)
          }}
          onSaved={() => completeStep(1, 2)}
        />
      </CheckoutStep>

      <CheckoutStep
        number={2}
        title="Delivery address"
        isOpen={openSteps.includes(2)}
        isCompleted={completedSteps.includes(2)}
        onToggle={() => toggleStep(2)}
      >
        <AddressStep
          address={form.address}
          city={form.city}
          postcode={form.postcode}
          country={form.country}
          onChange={(field, value) => {
            updateForm(field, value)
            uncompleteStep(2)
          }}
          onSaved={() => completeStep(2, 3)}
        />
      </CheckoutStep>

      <CheckoutStep
        number={3}
        title="Shipping method"
        isOpen={openSteps.includes(3)}
        isCompleted={completedSteps.includes(3)}
        onToggle={() => toggleStep(3)}
      >
        <ShippingStep
          selectedMethodId={form.shippingMethodId}
          onSelect={(id, priceCents) => {
            handleShippingSelect(id, priceCents)
            uncompleteStep(3)
          }}
          onSaved={() => completeStep(3, 4)}
        />
      </CheckoutStep>

      <CheckoutStep
        number={4}
        title="Payment"
        isOpen={openSteps.includes(4)}
        isCompleted={completedSteps.includes(4)}
        onToggle={() => toggleStep(4)}
      >
        <PaymentStep onSaved={() => completeStep(4, 5)} />
      </CheckoutStep>

      <CheckoutStep
        number={5}
        title="Order summary"
        isOpen={openSteps.includes(5)}
        isCompleted={false}
        onToggle={() => toggleStep(5)}
      >
        {!cart ? (
          <p className="text-sm text-zinc-500">Loading cart...</p>
        ) : (
          <CheckoutOrderSummary
            cart={cart}
            shippingCents={shippingCents}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            onPlaceOrder={handlePlaceOrder}
            isPlacingOrder={isPlacingOrder}
            canPlaceOrder={Boolean(isCheckoutComplete)}
            orderError={orderError}
          />
        )}
      </CheckoutStep>
    </div>
  </main>
)
}