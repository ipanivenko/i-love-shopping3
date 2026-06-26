import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth/resetPassword'

export default function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const rid = searchParams.get('rid') ?? ''
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasValidParams = useMemo(() => {
    return Boolean(rid && token)
  }, [rid, token])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!hasValidParams) {
      setError('Invalid or missing reset link.')
      return
    }

    if (!newPassword.trim()) {
      setError('Please enter a new password')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await resetPassword({
        rid,
        token,
        newPassword,
      })

      setSuccess('Your password has been reset successfully.')

      setTimeout(() => {
        navigate('/login')
      }, 1200)
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
          Reset password
        </h1>
        <p className="text-sm text-zinc-600">
          Enter your new password below.
        </p>
      </div>

      {!hasValidParams ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This password reset link is invalid or incomplete.
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="new-password"
          className="text-sm font-medium text-zinc-700"
        >
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-900"
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="text-sm font-medium text-zinc-700"
        >
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-900"
          autoComplete="new-password"
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
        disabled={loading || !hasValidParams}
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Resetting...' : 'Reset password'}
      </button>
    </form>
  )
}