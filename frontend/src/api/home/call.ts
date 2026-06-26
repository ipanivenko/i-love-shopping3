import type { ProductListItemDTO, PaginatedResponseDTO } from '@app/shared'
import type { HomeProduct } from './../../types/home'
import { formatPrice } from '../../utils/formatPrice'
import { API } from '../config'


console.log(API)
function mapToHomeProduct(
  product: ProductListItemDTO,
  badge: string,
): HomeProduct {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    price: formatPrice(product.priceCents),
    badge,
    image: product.image ?? '',
    href: `/products/${product.slug}`,
  }
}

async function fetchProducts(
  query: string,
): Promise<PaginatedResponseDTO<ProductListItemDTO>> {
  const res = await fetch(`${API}/products?${query}`)

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`)
  }

  return res.json()
}

export async function fetchFeaturedProducts(): Promise<HomeProduct[]> {
  const [newestData, topRatedData, bestSellerData, cheapestData, fallbackData] =
    await Promise.all([
      fetchProducts('gender=UNISEX&sortBy=createdAt&sortOrder=desc&page=1&pageSize=1'),
      fetchProducts('sortBy=rating&sortOrder=desc&page=1&pageSize=1'),
      fetchProducts('sortBy=rating&sortOrder=desc&page=2&pageSize=1'),
      fetchProducts('gender=UNISEX&sortBy=price&sortOrder=asc&page=1&pageSize=1'),
      fetchProducts('sortBy=rating&sortOrder=desc&page=3&pageSize=1'),
    ])

  let newest = newestData.items[0]
  const topRated = topRatedData.items[0]
  const bestSeller = bestSellerData.items[0]
  const cheapest = cheapestData.items[0]
  const fallback = fallbackData.items[0]

  if (newest.id === topRated.id || newest.id === bestSeller.id) {
    newest = fallback
  }

  const featured: HomeProduct[] = []

  if (newest) {
    featured.push(mapToHomeProduct(newest, 'New'))
  }

  if (topRated) {
    featured.push(mapToHomeProduct(topRated, 'Top rated'))
  }

  if (bestSeller) {
    featured.push(mapToHomeProduct(bestSeller, 'Best seller'))
  }

  if (cheapest) {
    featured.push(mapToHomeProduct(cheapest, 'Budget pick'))
  }

  return featured
}