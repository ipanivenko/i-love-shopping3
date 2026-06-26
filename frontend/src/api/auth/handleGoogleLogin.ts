import { API } from "../config"

export function handleGoogleLogin() {
  window.location.href = `${API}/auth/google`
}