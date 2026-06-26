import Container from '../components/ui/Container'
import { BackToShoppingButton } from '../components/ui/BackToShopping'

export default function AboutPage() {
  return (
    <main className="bg-white">
      <BackToShoppingButton label="Continue shopping" />
      <Container className="py-10">
        <section className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            About MoveOn
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Sports footwear made simple.
          </h1>

          <p className="mt-4 text-base leading-7 text-zinc-600">
            MoveOn is an online sports footwear store created to make it easier
            for customers to find reliable shoes for training, running, fitness,
            and everyday movement.
          </p>

          <p className="mt-4 text-base leading-7 text-zinc-600">
            The project was developed by Irina Panivenko as part of her studies
            in programming and software development. It was built as a practical
            learning project to apply modern web development skills through a
            real e-commerce experience.
          </p>
        </section>

        <section className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <h2 className="text-lg font-semibold text-zinc-950">
              Our Mission
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              To provide a simple, clear, and enjoyable shopping experience for
              people looking for quality sports footwear.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <h2 className="text-lg font-semibold text-zinc-950">
              What We Offer
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              MoveOn focuses on sports shoes from trusted brands, with clear
              product information, easy navigation, and a smooth checkout flow.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <h2 className="text-lg font-semibold text-zinc-950">
              The Project
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              This website is a study project designed to demonstrate practical
              skills in frontend development, backend development, product
              management, authentication, orders, and payments.
            </p>
          </div>
        </section>
      </Container>
    </main>
  )
}