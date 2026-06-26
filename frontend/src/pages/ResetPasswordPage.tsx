import { Link } from 'react-router-dom'
import ResetPasswordForm from '../components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <ResetPasswordForm />

        <div className="mt-4 text-center text-sm text-zinc-600">
          <Link to="/login" className="font-medium text-zinc-900 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}