import Button from '../ui/Button'
import Container from '../ui/Container'
import { useNavigate } from 'react-router'

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="py-10 lg:py-16">
      <Container className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-flex w-fit rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            New season
          </span>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Find your next pair.
          </h1>

          <p className="mt-5 max-w-xl text-base text-zinc-600 sm:text-lg">
            Discover performance footwear built for training, running, and everyday movement.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/products")} className="cursor-pointer">Shop now</Button>
            <Button onClick={() => navigate("/products")} variant="secondary" className="cursor-pointer">View new arrivals</Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-zinc-200">
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop"
            alt="Featured shoe"
            className="h-[320px] w-full object-cover sm:h-[420px] lg:h-full"
          />
        </div>
      </Container>
    </section>
  )
}