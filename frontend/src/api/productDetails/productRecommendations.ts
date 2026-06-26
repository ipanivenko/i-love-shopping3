import type { ProductCardItem } from '../../types/products'
import { API } from '../config'

export async function getProductRecommendations(
  slug: string,
): Promise<ProductCardItem[]> {
  const response = await fetch(
    `${API}/products/${slug}/recommendations`,
  )

  if (!response.ok) {
    throw new Error('Failed to load recommendations')
  }

  return response.json()
}