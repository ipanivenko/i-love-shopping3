import { useEffect, useState } from "react"
import type { ProductsResponse } from "../../types/products"
import { API } from "../config"

export function useProducts(query: string) {

  const [data, setData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API}/products?${query}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch products`)
        }

        const json: ProductsResponse = await res.json()

        setData(json)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [API, query])

  return {
    products: data?.items ?? [],
    pagination: data
      ? {
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
        }
      : null,
    loading,
    error,
  }
}