export function PaymentStep({ onSaved }: { onSaved?: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-500">
          Payment
        </h3>

        <p className="mt-1 flex items-center gap-2 text-zinc-900 font-semibold">
          💳 Credit / Debit card (Stripe)
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          You will enter your card details securely.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSaved?.()}
        className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
      >
        Continue
      </button>
    </div>
  )
}