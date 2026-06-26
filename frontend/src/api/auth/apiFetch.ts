import { refreshSession } from './refreshToken'
import { getAccessToken, setAccessToken } from './tokenStore'

let refreshPromise: Promise<string> | null = null

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)

  const token = getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })

  const isRefreshRequest = String(input).includes('/auth/refresh')

  if (response.status !== 401 || isRefreshRequest) {
    return response
  }

  try {
    if (!refreshPromise) {
      refreshPromise = refreshSession()
        .then(({ accessToken }) => {
          setAccessToken(accessToken)
          return accessToken
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    const newAccessToken = await refreshPromise

    const retryHeaders = new Headers(init.headers)
    retryHeaders.set('Authorization', `Bearer ${newAccessToken}`)

    return await fetch(input, {
      ...init,
      headers: retryHeaders,
      credentials: 'include',
    })
  } catch {
    setAccessToken(null)
    throw new Error('Session expired')
  }
}