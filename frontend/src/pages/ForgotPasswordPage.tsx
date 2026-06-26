import { Link } from 'react-router-dom'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <ForgotPasswordForm />

        <div className="mt-4 text-center text-sm text-zinc-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-zinc-900 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}