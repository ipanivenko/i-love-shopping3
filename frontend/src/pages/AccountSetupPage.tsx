import TwoFactorSection from '../components/auth/TwoFactorConfDisab'
import { Link } from 'react-router'
import AccountSetupSection from '../components/auth/AccountSetupComp'
import DeliveryInfoSection from '../components/checkout/DeliveryInfoSection'

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mt-10">
        <Link
          to="/"
          className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          ← Back to home
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-zinc-900">My account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Manage your account security and settings.
      </p>

      <div className="mt-8">
        <AccountSetupSection />
      </div>

      <div className="mt-8">
        <DeliveryInfoSection />
      </div>

      <div className="mt-8">
        <TwoFactorSection />
      </div>
    </main>
  )
}