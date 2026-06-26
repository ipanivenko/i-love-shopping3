import { useState } from 'react'
import { useNavigate } from 'react-router'
import { verifyTwoFactor } from '../../api/auth/verifyTwoFactor'
import { useAuth } from '../../context/AuthContext'

export default function TwoFactorComponent() {
  const navigate = useNavigate()
  const { setAccessToken, reloadUser } = useAuth()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Authentication code is required')
      return
    }

    try {
      setLoading(true)

      const data = await verifyTwoFactor({
        code: code.trim(),
      })

      setAccessToken(data.accessToken)
      reloadUser()      
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Verification failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Two-factor authentication
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Authentication code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="123456"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  )
}