import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import TwoFactorComponent from '../components/auth/TwoFactorVerify'

export default function TwoFactorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 text-zinc-900">
      <Header />

      <main>
        <section className="scroll-mt-24">
          <TwoFactorComponent />
        </section>
      </main>

      <Footer />
    </div>
  )
}