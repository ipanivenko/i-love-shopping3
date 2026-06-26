import type { NavigateFunction } from 'react-router'
import { ApiError } from '../api/auth/register'

export function handleAccountSetupRedirect(
  err: unknown,
  navigate: NavigateFunction,
  fallbackEmail?: string
): boolean {
  if (err instanceof ApiError && err.data.code === 'ACCOUNT_SETUP_REQUIRED') {
    navigate('/complete-account', {
      state: {
        email: err.data.email ?? fallbackEmail ?? '',
        canContinueWithGoogle: err.data.canContinueWithGoogle ?? true,
        needsName: err.data.needsName ?? true,
        needsPassword: err.data.needsPassword ?? true,
      },
    })
    return true
  }

  return false
}