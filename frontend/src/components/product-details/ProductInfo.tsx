import type { ProductDetails, ProductDetailsColor, ProductDetailsSku } from '@app/shared/product'
import ProductColorPicker from './ProductColorPicker'
import ProductSizePicker from './ProductSizePicker'

type ProductInfoProps = {
  product: ProductDetails
  selectedColor: ProductDetailsColor
  selectedSku: ProductDetailsSku | null
  selectedSizeId: string
  onSelectColor: (colorId: string) => void
  onSelectSize: (sizeId: string) => void
}

export default function ProductInfo({
  product,
  selectedColor,
  selectedSku,
  selectedSizeId,
  onSelectColor,
  onSelectSize,
}: ProductInfoProps) {
  return (
  <div className="space-y-8">
    {/* Main product header */}
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-emerald-900/5 backdrop-blur sm:p-8">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {product.brand.name}
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            {product.name}
          </h1>

          {product.ratingAvg !== null && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700 shadow-inner">
                <span className="mr-1">★</span>
                {product.ratingAvg.toFixed(1)}
              </div>

              <p className="text-sm font-medium text-zinc-500">
                {product.ratingCount} review
                {product.ratingCount === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-zinc-950 px-6 py-5 text-white shadow-xl shadow-zinc-900/20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Price
          </p>

          <p className="mt-1 text-3xl font-black tracking-tight">
            €{(product.priceCents / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </div>

    {/* Options card */}
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur sm:p-8">
      <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-teal-200/30 blur-3xl" />

      <div className="relative space-y-8">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Choose color
              </p>

              <p className="mt-1 text-sm font-semibold text-zinc-900">
                Color
              </p>
            </div>

            <p className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-zinc-600 shadow-sm">
              {selectedColor.colorName}
            </p>
          </div>

          <ProductColorPicker
            colors={product.colors}
            selectedColorName={selectedColor.colorName}
            onSelectColor={onSelectColor}
          />
        </div>

        <div className="h-px w-full bg-gradient-to-r from-emerald-200 via-zinc-200 to-transparent" />

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Choose size
              </p>

              <p className="mt-1 text-sm font-semibold text-zinc-900">
                Size
              </p>
            </div>

            {selectedSku?.sizeEU && (
              <p className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-zinc-600 shadow-sm">
                Selected: {selectedSku.sizeEU}
              </p>
            )}
          </div>

          <ProductSizePicker
            skus={selectedColor.skus}
            selectedSizeId={selectedSizeId}
            onSelectSize={onSelectSize}
          />
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-zinc-900/5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-zinc-950">
                Availability
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Select a size to check stock.
              </p>
            </div>

            {selectedSku ? (
              selectedSku.stockQty <= 0 ? (
                <span className="rounded-full bg-rose-100 px-3 py-1.5 text-sm font-bold text-rose-700">
                  Out of stock
                </span>
              ) : selectedSku.stockQty === 1 ? (
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
                  Last one
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700">
                  In stock
                </span>
              )
            ) : (
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-bold text-zinc-600">
                Not selected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)
}