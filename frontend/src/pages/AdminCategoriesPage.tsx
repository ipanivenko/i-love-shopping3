import { useEffect, useMemo, useState } from 'react'
import {
  archiveAdminCategory,
  createAdminCategory,
  getAdminCategories,
  restoreAdminCategory,
  updateAdminCategory,
} from '../api/admin/adminCatalog'
import type { AdminCategory } from '../api/admin/adminCatalog'
import { BackToDashboardButton } from '../components/admin/AdminButtons'

type CategoryForm = {
  name: string
  parentId: string
}

const emptyForm: CategoryForm = {
  name: '',
  parentId: '',
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  )
  const [categoryToArchive, setCategoryToArchive] =
    useState<AdminCategory | null>(null)

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visibleCategories = useMemo(() => {
    const text = search.toLowerCase().trim()

    return categories
      .filter((category) => {
        if (!text) return true

        return (
          category.name.toLowerCase().includes(text) ||
          category.slug.toLowerCase().includes(text) ||
          category.status.toLowerCase().includes(text) ||
          category.parent?.name.toLowerCase().includes(text)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, search])

  async function loadCategories() {
    try {
      setLoading(true)
      setError(null)

      const data = await getAdminCategories()
      setCategories(data)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load categories',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingCategory(null)
  }

  function startEdit(category: AdminCategory) {
    setEditingCategory(category)

    setForm({
      name: category.name,
      parentId: category.parent?.id ?? '',
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!form.name.trim()) return

    try {
      setSaving(true)
      setError(null)

      const payload = {
        name: form.name.trim(),
        parentId: form.parentId || undefined,
      }

      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, payload)
      } else {
        await createAdminCategory(payload)
      }

      resetForm()
      await loadCategories()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to save category',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!categoryToArchive) return

    try {
      setSaving(true)
      setError(null)

      await archiveAdminCategory(categoryToArchive.id)

      setCategoryToArchive(null)
      await loadCategories()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to archive category',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleRestore(category: AdminCategory) {
    try {
      setSaving(true)
      setError(null)

      await restoreAdminCategory(category.id)

      await loadCategories()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to restore category',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-6">Loading categories...</p>

  return (
    <div className="space-y-6 p-6">
        <BackToDashboardButton/>
      <div>
        <h1 className="text-2xl font-bold">Admin Categories</h1>
        <p className="text-sm text-gray-500">
          Create, edit, archive and restore categories.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">
          {editingCategory ? 'Edit category' : 'Add category'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="Category name"
            className="rounded border p-3 md:col-span-1"
            required
          />

          <select
            value={form.parentId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                parentId: event.target.value,
              }))
            }
            className="rounded border p-3 md:col-span-1"
          >
            <option value="">No parent category</option>

            {categories
              .filter((category) => category.id !== editingCategory?.id)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.parent
                    ? `${category.parent.name} / ${category.name}`
                    : category.name}
                </option>
              ))}
          </select>

          <div className="flex gap-2 md:col-span-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingCategory
                  ? 'Update category'
                  : 'Add category'}
            </button>

            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search category, slug, parent or status..."
        className="w-full rounded border bg-white p-3"
      />

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleCategories.map((category) => (
              <tr key={category.id} className="border-t">
                <td className="p-3 font-medium">{category.name}</td>
                <td className="p-3 text-gray-500">{category.slug}</td>
                <td className="p-3">
                  {category.parent ? category.parent.name : '—'}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${category.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {category.status}
                  </span>
                </td>
                <td className="space-x-2 p-3">
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="rounded border px-3 py-1"
                  >
                    Edit
                  </button>

                  {category.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() => setCategoryToArchive(category)}
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRestore(category)}
                      className="rounded bg-green-600 px-3 py-1 text-white"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {visibleCategories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {categoryToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Archive Category</h2>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to archive{' '}
              <span className="font-medium">{categoryToArchive.name}</span>?
            </p>

            <p className="mt-2 text-sm text-gray-500">
              You can restore it later.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCategoryToArchive(null)}
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
                {saving ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}