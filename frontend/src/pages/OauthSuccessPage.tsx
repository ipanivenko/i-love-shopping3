import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import OauthSuccessComponent from '../components/auth/OauthSuccessComp'

export default function OauthSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 text-zinc-900">
      <Header />

      <main>
        <section className="scroll-mt-24">
          <OauthSuccessComponent />
        </section>
      </main>

      <Footer />
    </div>
  )
}