import { useEffect, useState } from 'react'
import type { ProductDetails } from '@app/shared/product'
import { API } from '../config'
import { NotFoundError } from '../errors'

export function useProductDetails(slug: string) {

  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!slug) return

    let cancelled = false

    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API}/products/${slug}`)

        if (res.status === 404) {
          throw new NotFoundError('Product not found')
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch product`)
        }

        const json: ProductDetails = await res.json()

        if (!cancelled) setProduct(json)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProduct()

    return () => {
      cancelled = true
    }
  }, [slug, API])

  return { product, loading, error }
}