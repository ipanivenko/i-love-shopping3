import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { loginUser } from '../../api/auth/login'
import { getMe } from '../../api/auth/me'
import ContinueWithGoogleButton from './googleButtonComp'
import { handleAccountSetupRedirect } from '../../utils/AccountSetupRedirect'
import { ApiError } from '../../api/auth/register'
import { useAuth } from '../../context/AuthContext'
import { mergeGuestCart } from '../../api/cart/mergeCart'

type LoginFormData = {
  email: string
  password: string
}

export default function LoginForm() {
  const navigate = useNavigate()
  const { setAccessToken, setUser, setAuthLoading } = useAuth();

  const [form, setForm] = useState<LoginFormData>({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField<K extends keyof LoginFormData>(key: K, value: LoginFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate() {
    if (!form.email.trim()) {
      return 'Email is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      return 'Enter a valid email address'
    }

    if (!form.password) {
      return 'Password is required'
    }

    return ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)

      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
      })

      if (data.requires2fa) {
        navigate('/two-factor', {
          state: { tempToken: data.tempToken ?? null },
        })
        return
      }

      if (!data.accessToken) {
        setError('Login failed')
        return
      }

      setAccessToken(data.accessToken)

      const me = await getMe()
      setUser(me)
      setAuthLoading(false)

      await mergeGuestCart()
      window.dispatchEvent(new Event('cart-updated'))

      setSuccess('Signed in successfully.')
      setForm({
        email: '',
        password: '',
      })

      navigate('/')
    } catch (err) {
      if (handleAccountSetupRedirect(err, navigate, form.email.trim())) {
        return
      }

      if (err instanceof ApiError) {
        setError(err.data.message || 'Login failed')
        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in to continue shopping your favorite styles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-zinc-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
            Create account
          </Link>
        </p>

        <ContinueWithGoogleButton />
      </form>
    </div>
  )
}