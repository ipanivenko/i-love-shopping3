import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import ProductCard from '../products/ProductCard'
import type { ProductCardItem } from '../../types/products'
import { getProductRecommendations } from '../../api/productDetails/productRecommendations'

export default function RecommendedProductsSection() {
    const { slug } = useParams()

    const [products, setProducts] = useState<ProductCardItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

   useEffect(() => {
  if (!slug) return

  const productSlug = slug

  async function loadRecommendations() {
    try {
      setLoading(true)
      setError(null)

      const data = await getProductRecommendations(productSlug)

      setProducts(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load recommendations',
      )
    } finally {
      setLoading(false)
    }
  }

  loadRecommendations()
}, [slug])

    if (loading) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur md:p-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
            Recommended
          </p>

          <h2 className="text-2xl font-black tracking-tight text-zinc-950 md:text-3xl">
            You may also like
          </h2>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 p-4 shadow-lg shadow-zinc-900/5"
          >
            <div className="h-56 animate-pulse rounded-[1.4rem] bg-zinc-200/70" />
            <div className="mt-5 h-4 w-24 animate-pulse rounded-full bg-zinc-200/80" />
            <div className="mt-3 h-5 w-4/5 animate-pulse rounded-full bg-zinc-200/80" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-zinc-200/70" />
            <div className="mt-6 h-10 animate-pulse rounded-full bg-zinc-200/80" />
          </div>
        ))}
      </div>
    </section>
  )
}

if (error || products.length === 0) {
  return null
}

return (
  <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-2xl shadow-emerald-900/5 backdrop-blur md:p-8">
    <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

    <div className="relative mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
          Recommended picks
        </p>

        <h2 className="text-2xl font-black tracking-tight text-zinc-950 md:text-3xl">
          You may also like
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
          Products with similar style, category, or performance.
        </p>
      </div>

      <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
        {products.length} items
      </span>
    </div>

    <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  </section>
)
}