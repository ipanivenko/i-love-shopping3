import type { ProductDetails } from '@app/shared/product'

type ProductDescriptionProps = {
  product: ProductDetails
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  return (
    <section className="px-4 sm:px-0">
      <div className="max-w-3xl rounded-[2rem] border border-white/60 bg-white/50 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6 text-emerald-700"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Product Story
            </p>

            <h3 className="text-2xl font-black tracking-tight text-zinc-900">
              Description
            </h3>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-emerald-200 via-zinc-200 to-transparent" />

        <p className="mt-6 text-base leading-8 text-zinc-700 sm:text-lg">
          {product.description}
        </p>
      </div>
    </section>
  )
}