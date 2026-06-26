import Button from '../ui/Button'
import Container from '../ui/Container'
import { useNavigate } from 'react-router'

export default function PromoBanner() {
  const navigate = useNavigate()
  return (
    <section className="py-8">
      <Container>
        <div className="rounded-[2rem] bg-gradient-to-r from-emerald-800 via-green-700 to-teal-700 p-8 text-white shadow-lgrounded-[2rem] bg-gradient-to-r from-zinc-900 to-zinc-700 p-8 text-white shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
            Ready for your next workout?
          </span>
          <h2 className="mt-3 text-3xl font-black">Upgrade your performance.</h2>
          <p className="mt-3 max-w-2xl text-zinc-200">
            Discover new arrivals with performance footwear from the world’s leading sports brands.
          </p>
          <Button onClick={() => navigate("/products")} className="cursor-pointer mt-6" variant="secondary">
            Start shopping
          </Button>
        </div>
      </Container>
    </section>
  )
}