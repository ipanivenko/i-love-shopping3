import { useState } from 'react'
import { validateAddress } from '../../api/checkout/validateAddress'

type AddressStepProps = {
  address: string
  city: string
  postcode: string
  country: string
  onChange: <K extends 'address' | 'city' | 'postcode' | 'country'>(
    field: K,
    value: string,
  ) => void
  onSaved?: () => void
}

type FieldErrors = {
  address?: string
  city?: string
  postcode?: string
  country?: string
}



export function AddressStep({
  address,
  city,
  postcode,
  country,
  onChange,
  onSaved,
}: AddressStepProps) {

  const [isCheckingAddress, setIsCheckingAddress] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    status: 'idle' | 'valid' | 'invalid'
    message: string
    suggestion?: string
  }>({
    status: 'idle',
    message: '',
  })
  const [acceptInvalidAddress, setAcceptInvalidAddress] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function validate() {
    const nextErrors: FieldErrors = {}

    if (address.trim().length < 5) {
      nextErrors.address = 'Please enter a valid street address.'
    }

    if (city.trim().length < 2) {
      nextErrors.city = 'Please enter a valid city.'
    }

    if (!/^\d{4,6}$/.test(postcode)) {
      nextErrors.postcode = 'Postcode must contain 4 to 6 digits.'
    }

    if (country.trim().length < 2) {
      nextErrors.country = 'Please enter a valid country.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) return

    if (addressValidation.status === 'invalid' && acceptInvalidAddress) {
      onSaved?.()
      return
    }

    try {
      setIsCheckingAddress(true)
      setAddressValidation({ status: 'idle', message: '' })
      setAcceptInvalidAddress(false)

      const result = await validateAddress({
        address,
        city,
        postcode,
        country,
      })

      if (!result.valid) {
        setAddressValidation({
          status: 'invalid',
          message: result.message,
          suggestion: result.suggestion,
        })
        return
      }

      setAddressValidation({
        status: 'valid',
        message: result.message || 'Address verified successfully.',
        suggestion: result.suggestion,
      })

      onSaved?.()
    } catch (error) {
      setAddressValidation({
        status: 'invalid',
        message:
          error instanceof Error
            ? error.message
            : 'Address validation failed.',
      })
    } finally {
      setIsCheckingAddress(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Street address
          </label>

          <input
            value={address}
            onChange={(event) => {
              onChange('address', event.target.value.trimStart())
              setErrors((current) => ({ ...current, address: undefined }))
              setAddressValidation({
                status: 'idle',
                message: '',
              })

              setAcceptInvalidAddress(false)
            }}
            className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-zinc-900 ${errors.address ? 'border-red-500' : 'border-zinc-200'
              }`}
            placeholder="Kaivopuistontie 7A"
          />

          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            City
          </label>

          <input
            value={city}
            onChange={(event) => {
              onChange('city', event.target.value.trimStart())
              setErrors((current) => ({ ...current, city: undefined }))
              setAddressValidation({
                status: 'idle',
                message: '',
              })

              setAcceptInvalidAddress(false)
            }}
            className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-zinc-900 ${errors.city ? 'border-red-500' : 'border-zinc-200'
              }`}
            placeholder="Turku"
          />

          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Postcode
          </label>

          <input
            value={postcode}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, '').slice(0, 6)

              onChange('postcode', value)
              setErrors((current) => ({ ...current, postcode: undefined }))
              setAddressValidation({
                status: 'idle',
                message: '',
              })

              setAcceptInvalidAddress(false)
            }}
            inputMode="numeric"
            className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-zinc-900 ${errors.postcode ? 'border-red-500' : 'border-zinc-200'
              }`}
            placeholder="26100"
          />

          {errors.postcode && (
            <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Country
          </label>

          <input
            value={country}
            onChange={(event) => {
              onChange('country', event.target.value.trimStart())
              setErrors((current) => ({ ...current, country: undefined }))
              setAddressValidation({
                status: 'idle',
                message: '',
              })

              setAcceptInvalidAddress(false)
            }}
            className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-zinc-900 ${errors.country ? 'border-red-500' : 'border-zinc-200'
              }`}
            placeholder="Finland"
          />

          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>
      </div>

      {addressValidation.status === 'valid' && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium">Address verified</p>
        </div>
      )}

      {addressValidation.status === 'invalid' && (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div>
            <p className="mt-1">{addressValidation.message}</p>

            {addressValidation.suggestion && (
              <p className="mt-1">
                Suggested address: {addressValidation.suggestion}
              </p>
            )}
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptInvalidAddress}
              onChange={(event) => setAcceptInvalidAddress(event.target.checked)}
              className="mt-1"
            />

            <span>
              I confirm that this address is correct.
            </span>
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isCheckingAddress}
        className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCheckingAddress
          ? 'Checking address...'
          : addressValidation.status === 'invalid' && acceptInvalidAddress
            ? 'Accept and continue'
            : 'Done'}
      </button>
    </form>
  )
}