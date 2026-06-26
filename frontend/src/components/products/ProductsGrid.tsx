import ProductCard from './ProductCard'
import type { ProductCardItem } from '../../types/products'

type ProductsGridProps = {
  products: ProductCardItem[]
  viewMode: 'grid' | 'list'
}

export default function ProductsGrid({
  products,
  viewMode,
}: ProductsGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-[2rem] bg-white/80 p-10 text-center shadow-sm ring-1 ring-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900">
          No products found
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          Try changing your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <section
      className={
        viewMode === 'grid'
          ? 'grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
          : 'flex flex-col gap-5'
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
        />
      ))}
    </section>
  )
}