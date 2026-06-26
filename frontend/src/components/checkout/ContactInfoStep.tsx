import { useState } from 'react'

type ContactInfoStepProps = {
  fullName: string
  phone: string
  email: string
  onChange: <K extends 'fullName' | 'email' | 'phone' >(field: K, value: string) => void
  onSaved?: () => void
}

type FieldErrors = {
  fullName?: string
  email?: string
  phone?: string  
}

export function ContactInfoStep({
  fullName,
  email,
  phone,
  onChange,
  onSaved,
}: ContactInfoStepProps) {
  const [errors, setErrors] = useState<FieldErrors>({})

  function validate() {
    const nextErrors: FieldErrors = {}

    if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.'
    }

    // simple phone validation (at least 6 digits)
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 6) {
      nextErrors.phone = 'Please enter a valid phone number.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) return

    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Full name
          </label>

          <input
            value={fullName}
            onChange={(event) => {
              onChange('fullName', event.target.value.trimStart())
              setErrors((current) => ({ ...current, fullName: undefined }))
            }}
            className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-zinc-900 ${errors.fullName ? 'border-red-500' : 'border-zinc-200'
              }`}
            placeholder="John Doe"
          />

          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
  <label className="mb-2 block text-sm font-medium text-zinc-700">
    Email
  </label>

  <input
    type="email"
    value={email}
    onChange={(event) => {
      onChange('email', event.target.value.trim())
      setErrors((current) => ({ ...current, email: undefined }))
    }}
    className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-zinc-900 ${
      errors.email ? 'border-red-500' : 'border-zinc-200'
    }`}
    placeholder="john@example.com"
  />

  {errors.email && (
    <p className="mt-1 text-sm text-red-600">
      {errors.email}
    </p>
  )}
</div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Phone
          </label>

          <input
            value={phone}
            onChange={(event) => {
              const value = event.target.value
                .replace(/[^\d+ ]/g, '')
                .slice(0, 20)

              onChange('phone', value)

              setErrors((current) => ({ ...current, phone: undefined }))
            }}
            inputMode="tel"
            className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-zinc-900 ${errors.phone ? 'border-red-500' : 'border-zinc-200'
              }`}
            placeholder="+358 46 892 11 66"
          />

          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
      >
        Done
      </button>
    </form>
  )
}