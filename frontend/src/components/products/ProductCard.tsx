import { useState } from "react"
import type { ProductCardColor, ProductCardItem } from "../../types/products"
import { Link } from "react-router"

type ProductCardProps = {
  product: ProductCardItem
  viewMode?: 'grid' | 'list'
}

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(priceCents / 100)
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [selectedImage, setSelectedImage] = useState(product.image)
  const [selectedHoverImage, setSelectedHoverImage] = useState(product.hoverImage)
  const [isHoveringImage, setIsHoveringImage] = useState(false)
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.colorName ?? null)


  const handleColorSelect = (color: ProductCardColor) => {
    setSelectedColor(color.colorName)

    if (color.image) setSelectedImage(color.image)
    if (color.hoverImage) setSelectedHoverImage(color.hoverImage)
  }


  if (viewMode === 'list') {
    return (
      <Link
        to={`/products/${product.slug}?color=${encodeURIComponent(selectedColor ?? '')}`}
        className="block"
      >
        <article className="group flex overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-200 transition hover:shadow-md">
          <div
            className="relative w-44 shrink-0 sm:w-56"
            onMouseEnter={() => setIsHoveringImage(true)}
            onMouseLeave={() => setIsHoveringImage(false)}
          >
            <img
              src={selectedImage ?? 'https://placehold.co/600x700?text=Product'}
              alt={product.name}
              className="h-full min-h-44 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />

            {product.hoverImage && (
              <img
                src={selectedHoverImage || undefined}
                alt={`${product.name} hover`}
                className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${isHoveringImage ? 'opacity-100' : 'opacity-0'
                  }`}
              />
            )}

            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm">
              {product.brand}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {product.brand} • {product.category}
                {product.surface ? ` • ${product.surface}` : ''}
              </p>

              <h3 className="mt-2 text-lg font-bold text-zinc-900">
                {product.name}
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                {product.ratingAvg ? `★ ${product.ratingAvg.toFixed(1)}` : 'No rating'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xl font-bold text-zinc-900">
                {formatPrice(product.priceCents, product.currency)}
              </p>

              <div className="flex items-center gap-2">
                {product.colors.slice(0, 5).map((color) => {
                  const isActive = selectedColor === color.colorName

                  return (
                    <button
                      key={color.colorName}
                      type="button"
                      aria-label={color.colorName}
                      title={color.colorName}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleColorSelect(color)
                      }}
                      className={`h-5 w-5 rounded-full shadow-sm transition hover:scale-110 ${isActive
                        ? 'ring-2 ring-black border-black'
                        : 'border border-zinc-300'
                        }`}
                      style={{ backgroundColor: color.colorHex ?? '#d4d4d8' }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }


  return (
    <Link to={`/products/${product.slug}?color=${encodeURIComponent(selectedColor)}`} className="block">
      <article className="group overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-200 transition hover:shadow-md">
        <div
          className="relative"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        >
          <img
            src={selectedImage ?? 'https://placehold.co/600x700?text=Product'}
            alt={product.name}
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />

          {product.hoverImage && (
            <img
              src={selectedHoverImage || undefined}
              alt={`${product.name} hover`}
              className={`absolute inset-0 h-72 w-full object-cover transition duration-500
        ${isHoveringImage ? 'opacity-100' : 'opacity-0'}
      `}
            />
          )}

          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm">
            {product.brand}
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {product.category}
              {product.surface ? ` • ${product.surface}` : ''}
            </p>
            <h3 className="mt-1 text-base font-bold text-zinc-900">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-zinc-900">
              {formatPrice(product.priceCents, product.currency)}
            </p>

            <p className="text-sm text-zinc-500">
              {product.ratingAvg ? `★ ${product.ratingAvg.toFixed(1)}` : 'No rating'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {product.colors.slice(0, 5).map((color) => {
              const isActive = selectedColor === color.colorName

              return (
                <button
                  key={color.colorName}
                  type="button"
                  aria-label={color.colorName}
                  title={color.colorName}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleColorSelect(color)
                  }}
                  className={`h-5 w-5 rounded-full shadow-sm transition hover:scale-110
          ${isActive ? "ring-2 ring-black border-black" : "border border-zinc-300"}
        `}
                  style={{ backgroundColor: color.colorHex ?? "#d4d4d8" }}
                />
              )
            })}
          </div>
        </div>
      </article>
    </Link>
  )
}