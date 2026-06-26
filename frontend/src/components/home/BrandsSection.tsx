import Container from '../ui/Container'
import { homeBrands } from '../../data/home.products'

export default function BrandsSection() {
  return (
    <section id="brands" className="py-8">
      <Container>
       <div className="w-full px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-bold">Top brands</h2>
          <p className="text-sm text-zinc-600">
            Discover some of our most popular styles from leading sports brands.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-10 sm:grid-cols-4 items-center justify-items-center">
          {homeBrands.map((brand) => (
            <a
              key={brand.id}
              href={brand.href}
              className="flex items-center justify-center opacity-80 transition hover:opacity-100"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition"
              />
            </a>
          ))}
        </div>
      </div>
      </Container>
    </section>
  )
}