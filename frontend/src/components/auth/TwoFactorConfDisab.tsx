import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { setupTwoFactor } from '../../api/auth/setupTwoFactor'
import { confirmTwoFactor } from '../../api/auth/confirmTwoFactor'
import { disableTwoFactor } from '../../api/auth/disableTwoFactor'

export default function TwoFactorSection() {
  const { accessToken, user, setUser } = useAuth()

  const [loadingSetup, setLoadingSetup] = useState(false)
  const [loadingConfirm, setLoadingConfirm] = useState(false)
  const [loadingDisable, setLoadingDisable] = useState(false)

  const [setupData, setSetupData] = useState<{
    qrDataUrl: string
    manualSecret: string
    issuer: string
    label: string
  } | null>(null)

  const [code, setCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isTwoFactorEnabled = Boolean(user?.twoFactorEnabled)

  const handleSetup = async () => {
    setLoadingSetup(true)
    setError('')
    setSuccess('')

    try {
      if (!accessToken) {
        throw new Error('You are not authenticated')
      }

      const data = await setupTwoFactor(accessToken)
      setSetupData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoadingSetup(false)
    }
  }

  const handleConfirm = async () => {
    setLoadingConfirm(true)
    setError('')
    setSuccess('')

    try {
      if (!accessToken) {
        throw new Error('You are not authenticated')
      }

      const data = await confirmTwoFactor({ code }, accessToken)

      setUser(user ? { ...user, twoFactorEnabled: true } : null)
      setRecoveryCodes(Array.isArray(data.recoveryCodes) ? data.recoveryCodes : [])
      setSetupData(null)
      setSuccess('Two-factor authentication is now enabled.')
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoadingConfirm(false)
    }
  }

  const handleDisable = async () => {
    setLoadingDisable(true)
    setError('')
    setSuccess('')

    try {
      if (!accessToken) {
        throw new Error('You are not authenticated')
      }

      await disableTwoFactor(
        {
          password: disablePassword,
          code: disableCode,
        },
        accessToken
      )

      setUser(user ? { ...user, twoFactorEnabled: false } : null)
      setDisablePassword('')
      setDisableCode('')
      setRecoveryCodes([])
      setSuccess('Two-factor authentication has been disabled.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoadingDisable(false)
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Two-factor authentication</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Add an extra layer of security to your account.
      </p>

      {!setupData && !isTwoFactorEnabled && (
        <button
          type="button"
          onClick={handleSetup}
          disabled={loadingSetup}
          className="mt-5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loadingSetup ? 'Preparing...' : 'Set up 2FA'}
        </button>
      )}

      {setupData && !isTwoFactorEnabled && (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-zinc-900">Scan this QR code</p>
            <img
              src={setupData.qrDataUrl}
              alt="2FA QR code"
              className="mt-3 h-48 w-48 rounded-2xl border border-zinc-200 bg-white p-3"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-900">Or enter this secret manually</p>
            <code className="mt-2 block rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
              {setupData.manualSecret}
            </code>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-900">
              Enter 6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900"
            />
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loadingConfirm || code.length !== 6}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loadingConfirm ? 'Confirming...' : 'Confirm 2FA'}
          </button>
        </div>
      )}

      {isTwoFactorEnabled && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            2FA is enabled on your account.
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Disable 2FA</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Confirm your password and enter a valid authenticator code to disable it.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900">
                  Password
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900">
                  6-digit authentication code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900"
                />
              </div>

              <button
                type="button"
                onClick={handleDisable}
                disabled={
                  loadingDisable ||
                  disablePassword.trim().length === 0 ||
                  disableCode.length !== 6
                }
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {loadingDisable ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-zinc-900">Recovery codes</p>
          <p className="mt-1 text-sm text-zinc-600">
            Save these somewhere safe.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {recoveryCodes.map((item) => (
              <code
                key={item}
                className="rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800"
              >
                {item}
              </code>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-700">{success}</p>}
    </section>
  )
}