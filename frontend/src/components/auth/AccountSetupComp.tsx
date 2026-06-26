import { useState } from 'react'
import { accountSetup } from '../../api/auth/accountSetup'
import { useAuth } from '../../context/AuthContext'

export default function AccountSetupSection() {
    const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = form.name.trim()
    const wantsPasswordChange =
      form.password.trim().length > 0 || form.confirmPassword.trim().length > 0

    if (!trimmedName && !wantsPasswordChange) {
      setError('Please change your name or enter a new password')
      return
    }

    if (wantsPasswordChange) {
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters long')
        return
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    const payload: {
      name?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (trimmedName) {
      payload.name = trimmedName
    }

    if (wantsPasswordChange) {
      payload.password = form.password
      payload.confirmPassword = form.confirmPassword
    }

    try {
      setLoading(true)

      const result = await accountSetup(payload)

      setSuccess(result.message || 'Account updated successfully')
      setForm((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Profile & password</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Update your name and optionally set or change your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-500"
            placeholder="Enter your name"
            autoComplete="name"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-500"
            placeholder="Leave empty if you do not want to change it"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-500"
            placeholder="Repeat your new password"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </section>
  )
}