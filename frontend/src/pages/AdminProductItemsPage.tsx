import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminProduct } from '../api/admin/adminProductItem'
import type { Product } from '../types/adminProduct'

import { ColorsSection } from '../components/admin/ColorsSection'
import { ImagesSection } from '../components/admin/ImagesSection'
import { SkusSection } from '../components/admin/SkusSection'
import { useAuth } from '../context/AuthContext'
import { BackToProductsButton } from '../components/admin/AdminButtons'
import { NotFoundError } from '../api/errors'
import NotFoundPage from './NotFoundPage'

export function AdminProductItemsPage() {
  const { id } = useParams<{ id: string }>()

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { isAuthLoading } = useAuth()

  const selectedColor =
    product?.colors.find((color) => color.id === selectedColorId) ?? null

  async function loadProduct() {
    if (!id) return

    try {
      setError(null)
      setLoading(true)

      const data = await getAdminProduct(id)
      setProduct(data)

      if (!selectedColorId && data.colors.length > 0) {
        setSelectedColorId(data.colors[0].id)
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to load product'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [id])

  if (loading || isAuthLoading) {
    return <div className="p-6">Loading product...</div>
  }

 

  if (error instanceof NotFoundError) {
    return (
      <NotFoundPage
        title="Product not found"
        message="The product you are trying to manage does not exist."
      />
    )
  }

   if (!product || !id) {
    return
  }

  return (
    <div className="space-y-6 p-6">
      <BackToProductsButton />
      <div>
        <h1 className="text-2xl font-bold">Manage product items</h1>
        <p className="mt-1 text-lg font-medium">{product.name}</p>
        <p className="text-sm text-gray-500">
          Manage colors, images, sizes and stock.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <ColorsSection
        productId={id}
        colors={product.colors}
        selectedColorId={selectedColorId}
        setSelectedColorId={setSelectedColorId}
        reloadProduct={loadProduct}
        setPageError={(message) =>
          setError(message ? new Error(message) : null)
        }
      />

      {selectedColor && (
        <>
          <ImagesSection
            selectedColor={selectedColor}
            reloadProduct={loadProduct}
            setPageError={(message) =>
              setError(message ? new Error(message) : null)
            }
          />

          <SkusSection
            selectedColor={selectedColor}
            reloadProduct={loadProduct}
          />
        </>
      )}
    </div>
  )
}