import { useState } from 'react'
import {
  createAdminProductColor,
  updateAdminProductColor,
  deleteAdminProductColor,
} from '../../api/admin/adminProductItem'

import type { Product } from '../../types/adminProduct'

type Color = Product['colors'][number]

type Props = {
  productId: string
  colors: Color[]
  selectedColorId: string | null
  setSelectedColorId: (id: string | null) => void
  reloadProduct: () => Promise<void>
  setPageError: (message: string | null) => void
}

async function getResponseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.message || fallback
}

export function ColorsSection({
  productId,
  colors,
  selectedColorId,
  setSelectedColorId,
  reloadProduct,
  setPageError,
}: Props) {
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('#000000')

  const [editingColorId, setEditingColorId] = useState<string | null>(null)
  const [editColorName, setEditColorName] = useState('')
  const [editColorHex, setEditColorHex] = useState('#000000')

  const [colorToDelete, setColorToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleAddColor(event: React.FormEvent) {
    event.preventDefault()

    if (!colorName.trim()) {
      setPageError('Color name is required')
      return
    }

    try {
      setPageError(null)

      const newColor = await createAdminProductColor(productId, {
        colorName: colorName.trim(),
        colorHex,
      })

      setColorName('')
      setColorHex('#000000')
      setSelectedColorId(newColor.id)

      await reloadProduct()
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to add color')
    }
  }

  async function handleUpdateColor(event: React.FormEvent) {
    event.preventDefault()

    if (!editingColorId) return

    try {
      setPageError(null)

      const response = await updateAdminProductColor(editingColorId, {
        colorName: editColorName.trim(),
        colorHex: editColorHex,
      })

      if (!response.ok) {
        setPageError(await getResponseError(response, 'Failed to update color'))
        return
      }

      setEditingColorId(null)
      await reloadProduct()
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to update color')
    }
  }

  async function handleDeleteColor() {
    if (!colorToDelete) return

    try {
      setIsDeleting(true)
      setPageError(null)

      const response = await deleteAdminProductColor(colorToDelete)

      if (!response.ok) {
        setPageError(await getResponseError(response, 'Failed to delete color'))
        return
      }

      setSelectedColorId(null)
      setColorToDelete(null)

      await reloadProduct()
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Failed to delete color',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="rounded border p-4">
      <h2 className="mb-4 font-semibold">Colors</h2>

      <form onSubmit={handleAddColor} className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          value={colorName}
          onChange={(event) => setColorName(event.target.value)}
          placeholder="Color name, e.g. Black"
          className="rounded border p-2"
          required
        />

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorHex || '#000000'}
            onChange={(event) => setColorHex(event.target.value)}
            className="h-10 w-10 cursor-pointer border-0 bg-transparent"
          />

          <span className="font-mono text-sm">{colorHex}</span>
        </div>

        <button className="rounded bg-black px-4 py-2 text-white">
          Add color
        </button>
      </form>

      <div className="space-y-3">
        {colors.map((color) => (
          <div key={color.id} className="rounded border p-3">
            {editingColorId === color.id ? (
              <form onSubmit={handleUpdateColor} className="grid gap-3 md:grid-cols-4">
                <input
                  value={editColorName}
                  onChange={(event) => setEditColorName(event.target.value)}
                  className="rounded border p-2"
                  required
                />

                <input
                  type="color"
                  value={editColorHex || '#000000'}
                  onChange={(event) => setEditColorHex(event.target.value)}
                  className="h-10 w-10"
                />

                <button className="rounded bg-black px-4 py-2 text-white">
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setEditingColorId(null)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedColorId(color.id)}
                  className={`rounded border px-3 py-2 text-sm ${selectedColorId === color.id
                    ? 'bg-black text-white'
                    : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  {color.colorName}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingColorId(color.id)
                      setEditColorName(color.colorName)
                      setEditColorHex(color.colorHex ?? '#000000')
                    }}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setColorToDelete(color.id)}
                    className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>


      {colorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Color
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this color?
              All images, SKUs and related data will also be removed.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setColorToDelete(null)}
                disabled={isDeleting}
                className="rounded border px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteColor}
                disabled={isDeleting}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}