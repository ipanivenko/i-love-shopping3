import { useEffect, useMemo, useState } from 'react'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from '../api/admin/adminProducts'
import type { AdminProduct, ProductStatus } from '../api/admin/adminProducts'
import type { AdminBrand, AdminCategory } from '../api/admin/adminCatalog'
import {
  getAdminBrands,
  getAdminCategories,
} from '../api/admin/adminCatalog'
import { useAuth } from '../context/AuthContext'
import { DeleteProductModal } from '../components/admin/productDeleteModal'
import { ShoeSurface } from '@prisma/client'
import { useNavigate } from 'react-router'
import { BulkProductUploadModal } from '../components/admin/BulkUploadModal'
import { BackToDashboardButton } from '../components/admin/AdminButtons'

type ProductForm = {
  name: string
  description: string
  currency: string
  priceCents: string
  categoryId: string
  brandId: string
  status: ProductStatus

  gender: string
  surface: string

  weightGrams: string
  weightOunces: string

  lengthMm: string
  widthMm: string
  heightMm: string

  lengthIn: string
  widthIn: string
  heightIn: string
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  currency: 'EUR',
  priceCents: '',
  categoryId: '',
  brandId: '',
  status: 'DRAFT',

  gender: '',
  surface: '',

  weightGrams: '',
  weightOunces: '',

  lengthMm: '',
  widthMm: '',
  heightMm: '',

  lengthIn: '',
  widthIn: '',
  heightIn: '',
}

export function AdminProductsPage() {
  const { isAuthLoading } = useAuth()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])

  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)

  const navigate = useNavigate()

  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)

  function openBulkUploadModal() {
    setIsBulkUploadOpen(true)
  }

  function closeBulkUploadModal() {
    setIsBulkUploadOpen(false)
  }

  async function loadProducts() {
    const data = await getAdminProducts()
    setProducts(data)
  }

  async function loadCatalog() {
    const [brandsData, categoriesData] = await Promise.all([
      getAdminBrands(),
      getAdminCategories(),
    ])

    setBrands(brandsData)
    setCategories(categoriesData)
  }

  async function loadPageData() {
    try {
      setLoading(true)
      setError(null)

      await Promise.all([loadProducts(), loadCatalog()])
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to load admin products')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthLoading) return

    loadPageData()
  }, [isAuthLoading])

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => {
        const text = search.toLowerCase().trim()

        if (!text) return true

        return (
          product.name.toLowerCase().includes(text) ||
          product.brand.name.toLowerCase().includes(text) ||
          product.category.name.toLowerCase().includes(text) ||
          product.status.toLowerCase().includes(text)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [products, search])

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function openCreateProductModal() {
    setEditingId(null)
    setForm(emptyForm)
    setIsProductModalOpen(true)
  }

  function openEditProductModal(product: AdminProduct) {
    setEditingId(product.id)

    setForm({
      name: product.name,
      description: product.description,
      currency: product.currency,
      priceCents: String(product.priceCents),
      categoryId: product.category.id,
      brandId: product.brand.id,
      status: product.status,

      gender: product.gender ?? '',
      surface: product.surface ?? '',

      weightGrams: product.weightGrams ? String(product.weightGrams) : '',
      weightOunces: product.weightOunces ? String(product.weightOunces) : '',

      lengthMm: product.lengthMm ? String(product.lengthMm) : '',
      widthMm: product.widthMm ? String(product.widthMm) : '',
      heightMm: product.heightMm ? String(product.heightMm) : '',

      lengthIn: product.lengthIn ? String(product.lengthIn) : '',
      widthIn: product.widthIn ? String(product.widthIn) : '',
      heightIn: product.heightIn ? String(product.heightIn) : '',
    })

    setIsProductModalOpen(true)
  }

  function closeProductModal() {
    setEditingId(null)
    setForm(emptyForm)
    setIsProductModalOpen(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (isAuthLoading) return

    try {
      setSaving(true)
      setError(null)

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        currency: form.currency.trim() || 'EUR',
        priceCents: Number(form.priceCents),
        categoryId: form.categoryId,
        brandId: form.brandId,
        status: form.status,

        gender: form.gender || null,
        surface: form.surface || null,

        weightGrams: form.weightGrams ? Number(form.weightGrams) : null,
        weightOunces: form.weightOunces ? Number(form.weightOunces) : null,

        lengthMm: form.lengthMm ? Number(form.lengthMm) : null,
        widthMm: form.widthMm ? Number(form.widthMm) : null,
        heightMm: form.heightMm ? Number(form.heightMm) : null,

        lengthIn: form.lengthIn ? Number(form.lengthIn) : null,
        widthIn: form.widthIn ? Number(form.widthIn) : null,
        heightIn: form.heightIn ? Number(form.heightIn) : null,
      }

      if (editingId) {
        await updateAdminProduct(editingId, payload)
      } else {
        await createAdminProduct(payload)
      }

      closeProductModal()
      await loadProducts()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to save product')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!productToDelete) return

    try {
      setError(null)

      await deleteAdminProduct(productToDelete.id)

      setProductToDelete(null)
      await loadProducts()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to archive product')
      }
    }
  }


  if (isAuthLoading) {
    return <p className="p-6">Checking authentication...</p>
  }

  if (loading) {
    return <p className="p-6">Loading products...</p>
  }

  return (
    <div className="space-y-6 p-6">
        <BackToDashboardButton/>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Products</h1>
          <p className="text-sm text-gray-500">
            Manage products, brands and categories.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={openCreateProductModal}
            className="rounded bg-black px-4 py-2 text-white"
          >
            Add product
          </button>

          <button
            type="button"
            onClick={openBulkUploadModal}
            className="rounded border border-black px-4 py-2 hover:bg-gray-100"
          >
            Bulk upload
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search product, brand, category or status..."
        className="w-full rounded border bg-white p-3"
      />

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-3 font-medium">{product.name}</td>
                <td className="p-3">{product.brand.name}</td>
                <td className="p-3">{product.category.name}</td>
                <td className="p-3">
                  {(product.priceCents / 100).toFixed(2)} {product.currency}
                </td>
                <td className="p-3">{product.status}</td>
                <td className="space-x-2 p-3">
                  <button
                    type="button"
                    onClick={() => openEditProductModal(product)}
                    className="rounded border px-3 py-1"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductToDelete(product)}
                    className="rounded bg-red-600 px-3 py-1 text-white"
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/admin/products/${product.id}/items`)}
                    className="rounded bg-black px-3 py-2 text-sm text-white"
                  >
                    Manage items
                  </button>
                </td>
              </tr>
            ))}

            {visibleProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit product' : 'Create product'}
              </h2>

              <button
                type="button"
                onClick={closeProductModal}
                className="text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <section className="space-y-4">
                  <h3 className="font-medium">Basic information</h3>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Product name"
                    className="w-full rounded border p-2"
                    required
                  />

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    className="min-h-24 w-full rounded border p-2"
                    required
                  />

                  <div className="grid gap-3 md:grid-cols-3">
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      className="w-full rounded border p-2"
                      required
                    >
                      <option value="">Select category</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.parent
                            ? `${category.parent.name} / ${category.name}`
                            : category.name}
                        </option>
                      ))}
                    </select>

                    <select
                      name="brandId"
                      value={form.brandId}
                      onChange={handleChange}
                      className="w-full rounded border p-2"
                      required
                    >
                      <option value="">Select brand</option>

                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded border p-2"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-medium">Pricing</h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      name="priceCents"
                      type="number"
                      value={form.priceCents}
                      onChange={handleChange}
                      placeholder="Price in cents, example 12999"
                      className="w-full rounded border p-2"
                      required
                    />

                    <input
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      placeholder="Currency, example EUR"
                      className="w-full rounded border p-2"
                      required
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-medium">Shoe details</h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full rounded border p-2"
                    >
                      <option value="">No gender</option>
                      <option value="MEN">Men</option>
                      <option value="WOMEN">Women</option>
                      <option value="UNISEX">Unisex</option>
                      <option value="KIDS">Kids</option>
                    </select>

                    <select
                      name="surface"
                      value={form.surface}
                      onChange={handleChange}
                      className="w-full rounded border p-2"
                    >
                      <option value="">No surface</option>

                      {Object.values(ShoeSurface).map((surface) => (
                        <option key={surface} value={surface}>
                          {surface.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-medium">Weight</h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Weight (grams)
                      </label>

                      <input
                        name="weightGrams"
                        type="number"
                        value={form.weightGrams}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Weight (ounces)
                      </label>

                      <input
                        name="weightOunces"
                        type="number"
                        value={form.weightOunces}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-medium">Metric dimensions</h3>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Length (mm)
                      </label>

                      <input
                        name="lengthMm"
                        type="number"
                        value={form.lengthMm}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Width (mm)
                      </label>

                      <input
                        name="widthMm"
                        type="number"
                        value={form.widthMm}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Height (mm)
                      </label>

                      <input
                        name="heightMm"
                        type="number"
                        value={form.heightMm}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-medium">Imperial dimensions</h3>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Length (in)
                      </label>

                      <input
                        name="lengthIn"
                        type="number"
                        step="0.01"
                        value={form.lengthIn}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Width (in)
                      </label>

                      <input
                        name="widthIn"
                        type="number"
                        step="0.01"
                        value={form.widthIn}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Height (in)
                      </label>

                      <input
                        name="heightIn"
                        type="number"
                        step="0.01"
                        value={form.heightIn}
                        onChange={handleChange}
                        className="w-full rounded border p-2"
                      />
                    </div>
                  </div>

                </section>
              </div>

              <div className="flex justify-end gap-2 border-t bg-white p-6">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update product'
                      : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <DeleteProductModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />

      {isBulkUploadOpen && (
        <BulkProductUploadModal
          onClose={closeBulkUploadModal}
          onUploaded={loadProducts}
        />
      )}
    </div>


  )
}