import { API } from '../config'

type RefreshResponse = {
  accessToken: string
}

export async function refreshSession(): Promise<RefreshResponse> {
  const response = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Refresh Error Detail:', data);

    throw new Error(data.message || 'Failed to refresh session');
  }

  return data as RefreshResponse
}