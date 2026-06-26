import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe } from '../api/auth/me'
import { refreshSession } from '../api/auth/refreshToken'
import { logoutUser } from '../api/auth/logout'
import { setAccessToken as setStoredAccessToken } from '../api/auth/tokenStore'

export type UserRole = 'USER' | 'ADMIN' | 'SUPPORT'

type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
  twoFactorEnabled: boolean
}

type AuthContextType = {
  accessToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  setAccessToken: (token: string | null) => void
  setUser: (user: AuthUser | null) => void
  setAuthLoading: (loading: boolean) => void
  logout: () => Promise<void>
  reloadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  function setAccessToken(token: string | null) {
    setStoredAccessToken(token)
    setAccessTokenState(token)
  }

  async function reloadUser() {
    try {
      const me = await getMe()
      setUser(me)
    } catch {
      setAccessToken(null)
      setUser(null)
    }
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        const { accessToken } = await refreshSession()
        setAccessToken(accessToken)
        await reloadUser()
      } catch {
        setAccessToken(null)
        setUser(null)
      } finally {
        setIsAuthLoading(false)
      }
    }

    restoreSession()
  }, [])

  async function logout() {
    try {
      await logoutUser()
    } finally {
      setAccessToken(null)
      setUser(null)
      setIsAuthLoading(false)
    }
  }

  const isAuthenticated = Boolean(user && accessToken)

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated,
      isAuthLoading,
      setAccessToken,
      setUser,
      setAuthLoading: setIsAuthLoading,
      logout,
      reloadUser,
    }),
    [accessToken, user, isAuthenticated, isAuthLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}