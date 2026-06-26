import { useEffect, useState } from 'react'
import {
  getCheckoutPrefill,
  updateCheckoutProfile,
  type DeliveryProfile,
} from '../../api/checkout/deliveryProfile'

const emptyForm: DeliveryProfile = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postcode: '',
  country: '',
}

export default function DeliveryInfoSection() {
  const [form, setForm] = useState<DeliveryProfile>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadPrefill() {
      try {
        const profile = await getCheckoutPrefill()
        setForm({
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          postcode: profile.postcode,
          country: profile.country,
        })
      } catch (error) {
        console.error(error)
        setMessage('Could not load delivery information.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPrefill()
  }, [])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setMessage('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const updatedProfile = await updateCheckoutProfile(form)
      setForm(updatedProfile)
      setMessage('Delivery information saved.')
    } catch (error) {
      console.error(error)
      setMessage('Could not save delivery information.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-7">
        <p className="text-sm text-zinc-500">Loading delivery information...</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-7">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Delivery information
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Save your delivery details to prefill checkout next time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700">
              Full name
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full name"
              className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700">
              Address
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street and number"
              className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">
              City
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">
              Postcode
            </label>
            <input
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
              placeholder="Postcode"
              className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700">
              Country
            </label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Country"
              className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {message && (
            <p className="text-sm text-zinc-500">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="ml-auto rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save delivery info'}
          </button>
        </div>
      </form>
    </section>
  )
}