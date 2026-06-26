import { useState } from 'react'
import {
  createAdminProductSku,
  updateAdminProductSku,
  deleteAdminProductSku,
} from '../../api/admin/adminProductItem'

import type { Product } from '../../types/adminProduct'

type Color = Product['colors'][number]

type Props = {
  selectedColor: Color
  reloadProduct: () => Promise<void>
}

async function getResponseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.message || fallback
}

export function SkusSection({ selectedColor, reloadProduct }: Props) {
  const [sizeEU, setSizeEU] = useState('')
  const [sizeUS, setSizeUS] = useState('')
  const [sizeUK, setSizeUK] = useState('')
  const [barcode, setBarcode] = useState('')
  const [stockQty, setStockQty] = useState(1)
  const [skuError, setSkuError] = useState<string | null>(null)

  const [editingSkuId, setEditingSkuId] = useState<string | null>(null)
  const [editSizeEU, setEditSizeEU] = useState('')
  const [editSizeUS, setEditSizeUS] = useState('')
  const [editSizeUK, setEditSizeUK] = useState('')
  const [editBarcode, setEditBarcode] = useState('')
  const [editStockQty, setEditStockQty] = useState(1)

  async function handleAddSku(event: React.FormEvent) {
    event.preventDefault()

    try {
      setSkuError(null)

      const response = await createAdminProductSku(selectedColor.id, {
        sizeEU,
        sizeUS: sizeUS || undefined,
        sizeUK: sizeUK || undefined,
        barcode: barcode || undefined,
        stockQty,
      })

      if (!response.ok) {
        setSkuError(await getResponseError(response, 'Failed to create SKU'))
        return
      }

      setSizeEU('')
      setSizeUS('')
      setSizeUK('')
      setBarcode('')
      setStockQty(1)

      await reloadProduct()
    } catch (error) {
      setSkuError(error instanceof Error ? error.message : 'Failed to create SKU')
    }
  }

  async function handleUpdateSku(event: React.FormEvent) {
    event.preventDefault()

    if (!editingSkuId) return

    try {
      setSkuError(null)

      const response = await updateAdminProductSku(editingSkuId, {
        sizeEU: editSizeEU,
        sizeUS: editSizeUS || undefined,
        sizeUK: editSizeUK || undefined,
        barcode: editBarcode || null,
        stockQty: editStockQty,
      })

      if (!response.ok) {
        setSkuError(await getResponseError(response, 'Failed to update SKU'))
        return
      }

      setEditingSkuId(null)
      await reloadProduct()
    } catch (error) {
      setSkuError(error instanceof Error ? error.message : 'Failed to update SKU')
    }
  }

  async function handleDeleteSku(skuId: string) {
    const confirmed = window.confirm('Delete this SKU?')
    if (!confirmed) return

    try {
      setSkuError(null)

      const response = await deleteAdminProductSku(skuId)

      if (!response.ok) {
        setSkuError(await getResponseError(response, 'Failed to delete SKU'))
        return
      }

      await reloadProduct()
    } catch (error) {
      setSkuError(error instanceof Error ? error.message : 'Failed to delete SKU')
    }
  }

  return (
    <section className="rounded border p-4">
      <h2 className="mb-4 font-semibold">
        Sizes and stock for {selectedColor.colorName}
      </h2>

      {skuError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {skuError}
        </div>
      )}

      <form onSubmit={handleAddSku} className="mb-4 grid gap-3 md:grid-cols-5">
        <input
          value={sizeEU}
          onChange={(event) => setSizeEU(event.target.value)}
          placeholder="EU size"
          className="rounded border p-2"
          required
        />

        <input
          value={sizeUS}
          onChange={(event) => setSizeUS(event.target.value)}
          placeholder="US size"
          className="rounded border p-2"
        />

        <input
          value={sizeUK}
          onChange={(event) => setSizeUK(event.target.value)}
          placeholder="UK size"
          className="rounded border p-2"
        />

        <input
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          placeholder="Barcode optional"
          className="rounded border p-2"
        />

        <input
          type="number"
          value={stockQty}
          onChange={(event) => setStockQty(Number(event.target.value))}
          placeholder="Stock"
          className="rounded border p-2"
          min={1}
          required
        />

        <button
          disabled={!sizeEU}
          className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400 md:col-span-5"
        >
          Add SKU
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2 text-left">EU</th>
              <th className="border p-2 text-left">US</th>
              <th className="border p-2 text-left">UK</th>
              <th className="border p-2 text-left">SKU</th>
              <th className="border p-2 text-left">Barcode</th>
              <th className="border p-2 text-left">Stock</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {selectedColor.skus.map((skuItem) => (
              <tr key={skuItem.id}>
                {editingSkuId === skuItem.id ? (
                  <>
                    <td className="border p-2">
                      <input
                        value={editSizeEU}
                        onChange={(event) => setEditSizeEU(event.target.value)}
                        className="w-20 rounded border p-1"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        value={editSizeUS}
                        onChange={(event) => setEditSizeUS(event.target.value)}
                        className="w-20 rounded border p-1"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        value={editSizeUK}
                        onChange={(event) => setEditSizeUK(event.target.value)}
                        className="w-20 rounded border p-1"
                      />
                    </td>

                    <td className="border p-2">{skuItem.sku}</td>

                    <td className="border p-2">
                      <input
                        value={editBarcode}
                        onChange={(event) => setEditBarcode(event.target.value)}
                        className="w-32 rounded border p-1"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        type="number"
                        value={editStockQty}
                        onChange={(event) =>
                          setEditStockQty(Number(event.target.value))
                        }
                        className="w-20 rounded border p-1"
                        min={0}
                      />
                    </td>

                    <td className="border p-2">
                      <form onSubmit={handleUpdateSku} className="flex gap-2">
                        <button className="rounded bg-black px-3 py-1 text-white">
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingSkuId(null)}
                          className="rounded border px-3 py-1"
                        >
                          Cancel
                        </button>
                      </form>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2">{skuItem.sizeEU}</td>
                    <td className="border p-2">{skuItem.sizeUS}</td>
                    <td className="border p-2">{skuItem.sizeUK}</td>
                    <td className="border p-2">{skuItem.sku}</td>
                    <td className="border p-2">{skuItem.barcode}</td>
                    <td className="border p-2">{skuItem.stockQty}</td>

                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSkuId(skuItem.id)
                            setEditSizeEU(skuItem.sizeEU)
                            setEditSizeUS(skuItem.sizeUS ?? '')
                            setEditSizeUK(skuItem.sizeUK ?? '')
                            setEditBarcode(skuItem.barcode ?? '')
                            setEditStockQty(skuItem.stockQty)
                          }}
                          className="rounded border px-3 py-1"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSku(skuItem.id)}
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}