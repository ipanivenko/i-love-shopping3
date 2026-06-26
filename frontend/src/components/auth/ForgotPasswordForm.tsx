import { useState } from 'react'
import { forgotPassword } from '../../api/auth/forgotPassword'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setSuccess('')

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter your email')
      return
    }

    setLoading(true)

    try {
      await forgotPassword({ email: trimmedEmail })
      setSuccess(
        'A password reset link has been sent.'
      )
      setEmail('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Forgot password
        </h1>
        <p className="text-sm text-zinc-600">
          Enter your email address and we will send you a password reset link.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="forgot-email"
          className="text-sm font-medium text-zinc-700"
        >
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-900"
          autoComplete="email"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  )
}