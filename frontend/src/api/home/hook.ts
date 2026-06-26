import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedProducts } from './call'
import type { HomeProduct } from '../../types/home'

export function useFeaturedProducts() {
  return useQuery<HomeProduct[]>({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
  })
}