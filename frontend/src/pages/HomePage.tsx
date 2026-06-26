import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/home/HeroSection'
import CategoriesSection from '../components/home/CategoriesSection'
import FeaturedSection from '../components/home/FeaturedSection'
import PromoBanner from '../components/home/PromoBanner'
import BrandsSection from '../components/home/BrandsSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 text-zinc-900">
      <Header />

      <main>
        <HeroSection />
        
        <section id="shop" className="scroll-mt-24">
          <CategoriesSection />
        </section>

        <section id="featured" className="scroll-mt-24">
          <FeaturedSection />
        </section>

        <PromoBanner />

        <section id="brands" className="scroll-mt-24">
          <BrandsSection />
        </section>
      </main>

      <Footer />
    </div>
  )
}