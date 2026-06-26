import { Trash2 } from 'lucide-react'
import type { CartPreviewResponse } from '@app/shared/cart'

type CheckoutOrderSummaryProps = {
  cart: CartPreviewResponse
  shippingCents: number
  onQuantityChange: (skuId: string, quantity: number) => void
  onRemove: (skuId: string) => void
  onPlaceOrder: () => void
  isPlacingOrder?: boolean
  canPlaceOrder: boolean
  orderError?: string
}

export function CheckoutOrderSummary({
  cart,
  shippingCents,
  onQuantityChange,
  onRemove,
  onPlaceOrder,
  isPlacingOrder,
  canPlaceOrder,
  orderError
}: CheckoutOrderSummaryProps) {
  const totalCents = cart.subtotalCents + shippingCents

  function formatPrice(priceCents: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceCents / 100)
  }

  return (
    <form className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <h2 className="text-lg font-semibold text-zinc-950">Order summary</h2>

      <div className="mt-5 space-y-4">
        {cart.items.map((item) => (
          <div key={item.skuId} className="flex gap-3 rounded-xl bg-white p-3">
            <img
              src={item.imageUrl ?? ''}
              alt={item.name}
              className="h-20 w-20 rounded-lg bg-zinc-50 object-contain"
            />

            <div className="flex flex-1 flex-col">
              <div>
                <p className="text-xs text-zinc-500">{item.brandName}</p>
                <p className="text-sm font-semibold text-zinc-950">
                  {item.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {item.colorName} · EU {item.sizeEU}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onQuantityChange(item.skuId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="h-7 w-7 rounded-full border border-zinc-300 text-sm disabled:opacity-40"
                  >
                    -
                  </button>

                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      onQuantityChange(item.skuId, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.availableQuantity}
                    className="h-7 w-7 rounded-full border border-zinc-300 text-sm disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.skuId)}
                  className="text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-sm font-semibold text-zinc-950">
              {formatPrice(item.lineTotalCents)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Subtotal</span>
          <span className="font-medium">{formatPrice(cart.subtotalCents)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">Shipping</span>
          <span className="font-medium">{formatPrice(shippingCents)}</span>
        </div>

        <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-bold">
          <span>Total</span>
          <span>{formatPrice(totalCents)}</span>
        </div>

        {orderError && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {orderError}
          </p>
        )}

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={!canPlaceOrder || isPlacingOrder}
          className="mt-6 w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlacingOrder ? 'Placing order...' : 'Place order'}
        </button>

      </div>
    </form>
  )
}