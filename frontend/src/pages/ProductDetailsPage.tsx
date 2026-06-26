import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ProductDetailsSection from '../components/product-details/ProductDetailsSection'
import RecommendedProductsSection from '../components/product-details/RecommendationSection'
import { useParams } from 'react-router'
import { useEffect } from 'react'

export default function ProductDetailsPage() {
  const { slug } = useParams()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [slug])
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-teal-100 text-zinc-900">
      <Header />

      <main className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        </div>

        <section className="relative scroll-mt-24 px-4 py-10">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 shadow-2xl shadow-emerald-900/5 backdrop-blur">
              <ProductDetailsSection />
              <RecommendedProductsSection />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}