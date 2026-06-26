import { useEffect, useState } from 'react'
import {
  getShippingMethods,
  type ShippingMethod,
} from '../../api/checkout/shippingMethods'

type ShippingStepProps = {
  selectedMethodId: string
  onSelect: (id: string, priceCents: number) => void
  onSaved?: () => void
}

export function ShippingStep({
  selectedMethodId,
  onSelect,
  onSaved,
}: ShippingStepProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMethods() {
      try {
        setError('')

        const data = await getShippingMethods()
        setMethods(data)

        if (!selectedMethodId && data.length > 0) {
          onSelect(data[0].id, data[0].priceCents)
        }
      } catch {
        setError('Could not load shipping methods.')
      } finally {
        setIsLoading(false)
      }
    }

    loadMethods()
  }, [selectedMethodId, onSelect])

  function formatPrice(priceCents: number) {
    if (priceCents === 0) return 'Free'

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceCents / 100)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedMethodId) {
      setError('Please select a shipping method.')
      return
    }

    onSaved?.()
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
        Loading shipping methods...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethodId === method.id

          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition ${isSelected
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
            >
              <div className="flex gap-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onSelect(method.id, method.priceCents)}
                  className="mt-1"
                />

                <div>
                  <p className="font-semibold text-zinc-900">{method.name}</p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {method.description}
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold text-zinc-900">
                {formatPrice(method.priceCents)}
              </p>
            </label>
          )
        })}
      </div>

      <button
        type="submit"
        className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
      >
        Save
      </button>
    </form>
  )
}