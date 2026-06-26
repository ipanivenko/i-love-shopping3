import { useEffect, useMemo, useState } from 'react'
import {
  archiveAdminBrand,
  createAdminBrand,
  getAdminBrands,
  restoreAdminBrand,
  updateAdminBrand,
} from '../api/admin/adminCatalog'
import type { AdminBrand } from '../api/admin/adminCatalog'
import { BackToDashboardButton } from '../components/admin/AdminButtons'

type BrandForm = {
  name: string
}

const emptyForm: BrandForm = {
  name: '',
}

export function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [form, setForm] = useState<BrandForm>(emptyForm)

  const [editingBrand, setEditingBrand] =
    useState<AdminBrand | null>(null)

  const [brandToArchive, setBrandToArchive] =
    useState<AdminBrand | null>(null)

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visibleBrands = useMemo(() => {
    const text = search.toLowerCase().trim()

    return brands
      .filter((brand) => {
        if (!text) return true

        return (
          brand.name.toLowerCase().includes(text) ||
          brand.slug.toLowerCase().includes(text) ||
          brand.status.toLowerCase().includes(text)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [brands, search])

  async function loadBrands() {
    try {
      setLoading(true)
      setError(null)

      const data = await getAdminBrands()
      setBrands(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load brands',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingBrand(null)
  }

  function startEdit(brand: AdminBrand) {
    setEditingBrand(brand)

    setForm({
      name: brand.name,
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!form.name.trim()) return

    try {
      setSaving(true)
      setError(null)

      if (editingBrand) {
        await updateAdminBrand(editingBrand.id, {
          name: form.name.trim(),
        })
      } else {
        await createAdminBrand({
          name: form.name.trim(),
        })
      }

      resetForm()
      await loadBrands()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save brand',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!brandToArchive) return

    try {
      setSaving(true)
      setError(null)

      await archiveAdminBrand(brandToArchive.id)

      setBrandToArchive(null)
      await loadBrands()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to archive brand',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleRestore(brand: AdminBrand) {
    try {
      setSaving(true)
      setError(null)

      await restoreAdminBrand(brand.id)

      await loadBrands()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to restore brand',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="p-6">Loading brands...</p>
  }

  return (
    <div className="space-y-6 p-6">
      <BackToDashboardButton/>
      <div>
        <h1 className="text-2xl font-bold">
          Admin Brands
        </h1>

        <p className="text-sm text-gray-500">
          Create, edit, archive and restore brands.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">
          {editingBrand ? 'Edit brand' : 'Add brand'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex gap-2"
        >
          <input
            value={form.name}
            onChange={(event) =>
              setForm({
                name: event.target.value,
              })
            }
            placeholder="Brand name"
            className="flex-1 rounded border p-3"
            required
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : editingBrand
                ? 'Update brand'
                : 'Add brand'}
          </button>

          {editingBrand && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search brand, slug or status..."
        className="w-full rounded border bg-white p-3"
      />

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleBrands.map((brand) => (
              <tr
                key={brand.id}
                className="border-t"
              >
                <td className="p-3 font-medium">
                  {brand.name}
                </td>

                <td className="p-3 text-gray-500">
                  {brand.slug}
                </td>

                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      brand.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {brand.status}
                  </span>
                </td>

                <td className="space-x-2 p-3">
                  <button
                    type="button"
                    onClick={() => startEdit(brand)}
                    className="rounded border px-3 py-1"
                  >
                    Edit
                  </button>

                  {brand.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandToArchive(brand)
                      }
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleRestore(brand)
                      }
                      className="rounded bg-green-600 px-3 py-1 text-white"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {visibleBrands.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-gray-500"
                >
                  No brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {brandToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              Archive Brand
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to archive{' '}
              <span className="font-medium">
                {brandToArchive.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-gray-500">
              You can restore it later.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBrandToArchive(null)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleArchive}
                disabled={saving}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving
                  ? 'Archiving...'
                  : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}