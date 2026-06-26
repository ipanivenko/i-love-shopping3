import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import RegisterForm from '../components/auth/RegisterFormComponent'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-teal-100 text-zinc-900">
      <Header />

      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="hidden lg:block">
              <div className="max-w-xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Welcome
                </p>
                <h1 className="text-5xl font-semibold leading-tight tracking-tight text-zinc-900">
                  Create your account and step into something good.
                </h1>
                <p className="mt-5 text-lg leading-8 text-zinc-700">
                  Save favorites, track orders, and make shopping easier with a clean personal
                  account.
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <RegisterForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}