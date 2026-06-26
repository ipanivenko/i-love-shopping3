import Container from '../ui/Container'
import { homeCategories } from '../../data/home.products'

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-8">
      <Container>
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Shop by category</h2>
          <p className="text-sm text-zinc-600">Shop performance footwear for men, women, and kids — built for training, running, and everyday comfort.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {homeCategories.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-200"
            >
              <a href={item.href}>
              <img
                src={item.image}
                alt={item.title}
                className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              </a>
              <div className="p-5">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}