import { useState, useRef } from 'react'
import { registerUser } from '../../api/auth/register'
import { Link, useNavigate } from 'react-router'
import ReCAPTCHA from 'react-google-recaptcha'
import ContinueWithGoogleButton from './googleButtonComp'
import { handleAccountSetupRedirect } from '../../utils/AccountSetupRedirect'
import { ApiError } from '../../api/auth/register'
type RegisterFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export default function RegisterForm() {
  const navigate = useNavigate()
  const captchaRef = useRef<ReCAPTCHA | null>(null)

  const [form, setForm] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [captchaToken, setCaptchaToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField<K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate() {
    if (!form.name.trim()) {
      return 'Name is required'
    }

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

    if (form.password.length < 8) {
      return 'Password must be at least 8 characters'
    }

    if (!form.confirmPassword) {
      return 'Please confirm your password'
    }

    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match'
    }

    if (!captchaToken) {
      return 'Please complete the CAPTCHA'
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

      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        captchaToken,
      })

      setSuccess('Account created successfully. You can now sign in.')
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setCaptchaToken('')
      captchaRef.current?.reset()
    } catch (err) {
      if (handleAccountSetupRedirect(err, navigate, form.email.trim())) {
        return
      }

      if (err instanceof ApiError) {
        setError(err.data.message || 'Registration failed')
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
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Create account</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Join and start shopping your favorite styles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            placeholder="Your name"
          />
        </div>

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
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            placeholder="Repeat your password"
          />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
          <ReCAPTCHA
            ref={captchaRef}
            sitekey={siteKey}
            hl="en"
            onChange={(token) => setCaptchaToken(token ?? '')}
            onExpired={() => setCaptchaToken('')}
            onErrored={() => setCaptchaToken('')}
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-zinc-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
            Sign in
          </Link>
        </p>

        <ContinueWithGoogleButton />
      </form>
    </div>
  )
}