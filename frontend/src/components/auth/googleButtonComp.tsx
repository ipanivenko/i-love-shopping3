import { handleGoogleLogin } from "../../api/auth/handleGoogleLogin"

export default function ContinueWithGoogleButton() {
    return (
        <button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
>
  Continue with Google
</button>
    )
}