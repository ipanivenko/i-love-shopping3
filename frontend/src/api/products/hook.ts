import { useQuery } from "@tanstack/react-query"
import { fetchFilters} from './call'

export function useProductsFilters() {
  return useQuery({
    queryKey: ["products-filters"],
    queryFn: fetchFilters,
  })
}