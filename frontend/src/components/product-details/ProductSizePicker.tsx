import { useMemo, useState } from 'react'
import type { ProductDetailsSku } from '@app/shared/product'

type SizeSystem = 'EU' | 'UK' | 'US'

type ProductSizePickerProps = {
  skus: ProductDetailsSku[]
  selectedSizeId: string
  onSelectSize: (sizeId: string) => void
}

export default function ProductSizePicker({
  skus,
  selectedSizeId,
  onSelectSize,
}: ProductSizePickerProps) {
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('EU')

  const sortedSkus = useMemo(() => {
    return [...skus].sort((a, b) => {
      const aValue = getSizeValue(a, sizeSystem)
      const bValue = getSizeValue(b, sizeSystem)

      return Number(aValue) - Number(bValue)
    })
  }, [skus, sizeSystem])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-900">Size</p>

        <div className="flex items-center rounded-full bg-zinc-100 p-1">
          {(['EU', 'UK', 'US'] as const).map((system) => {
            const active = sizeSystem === system

            return (
              <button
                key={system}
                type="button"
                onClick={() => setSizeSystem(system)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {system}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
        {sortedSkus.map((sku) => {
          const disabled = sku.stockQty <= 0
          const active = sku.id === selectedSizeId
          const sizeLabel = getSizeValue(sku, sizeSystem)

          return (
            <button
              key={sku.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSize(sku.id)}
              className={`h-8 rounded-md border text-[13px] font-medium transition ${
                active
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-500'
              } ${
                disabled
                  ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 opacity-50'
                  : ''
              }`}
            >
              {sizeLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function getSizeValue(sku: ProductDetailsSku, sizeSystem: SizeSystem): string {
  if (sizeSystem === 'EU') return String(sku.sizeEU ?? '')
  if (sizeSystem === 'UK') return String(sku.sizeUK ?? '')
  return String(sku.sizeUS ?? '')
}