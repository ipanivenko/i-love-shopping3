import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { completeGoogleOauth } from '../../api/auth/googleOauth'
import { useAuth } from '../../context/AuthContext'

export default function OauthSuccessComponent() {
  const navigate = useNavigate()
  const { setAccessToken } = useAuth()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function finishOauthLogin() {
      try {
        const data = await completeGoogleOauth()
        setAccessToken(data.accessToken)
        navigate('/', { replace: true })
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to complete Google sign-in')
        }
      } finally {
        setLoading(false)
      }
    }

    finishOauthLogin()
  }, [navigate, setAccessToken])

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur">
        {loading && !error && (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Signing you in
            </h1>
            <p className="mt-3 text-sm text-zinc-600">
              Please wait while we complete your Google sign-in.
            </p>
          </>
        )}

        {!loading && error && (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Sign-in failed
            </h1>
            <p className="mt-3 text-sm text-red-600">{error}</p>

            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}