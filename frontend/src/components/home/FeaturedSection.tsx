import Container from '../ui/Container'
import { useFeaturedProducts } from '../../api/home/hook'

export default function FeaturedSection() {
  const {
    data: featuredProducts = [],
    isLoading,
    isError,
    error,
  } = useFeaturedProducts()

  if (isLoading) {
    return (
      <section id="featured" className="py-8">
        <Container>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Featured products</h2>
            <p className="text-sm text-zinc-600">
              A selection of standout models chosen for comfort, performance,
              and everyday wear.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <article
                key={i}
                className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-200 animate-pulse"
              >
                <div className="h-56 w-full bg-zinc-200" />

                <div className="p-4">
                  <div className="h-4 w-20 bg-zinc-200 rounded mb-2" />
                  <div className="h-5 w-32 bg-zinc-200 rounded mb-4" />

                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-zinc-200 rounded" />
                    <div className="h-8 w-16 bg-zinc-200 rounded-xl" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  if (isError) {
    return (
      <section id="featured" className="py-8">
        <Container>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Featured products</h2>
            <p className="text-sm text-zinc-600">
              A selection of standout models chosen for comfort, performance, and everyday wear.
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
            {error instanceof Error ? error.message : 'Failed to load featured products.'}
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section id="featured" className="py-8">
      <Container>
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <p className="text-sm text-zinc-600">
            A selection of standout models chosen for comfort, performance, and everyday wear.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-[2rem] bg-green-100 shadow-sm ring-1 ring-zinc-200"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {product.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-black text-white px-3 py-1 text-xs font-semibold shadow">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="text-sm text-zinc-500">{product.brand}</div>
                <h3 className="mt-1 text-lg font-bold">{product.name}</h3>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-base font-semibold">{product.price}</span>
                  <a
                    href={product.href}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                  >
                    View
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}