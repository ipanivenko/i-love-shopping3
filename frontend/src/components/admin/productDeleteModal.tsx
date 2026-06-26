import type { AdminProduct } from '../../api/admin/adminProducts'

type Props = {
  product: AdminProduct | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteProductModal({ product, onClose, onConfirm }: Props) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Archive Product</h2>

        <p className="mt-3 text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-medium">{product.name}</span>?
        </p>

        <p className="mt-2 text-sm text-gray-500">
          The product will not be deleted permanently.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}