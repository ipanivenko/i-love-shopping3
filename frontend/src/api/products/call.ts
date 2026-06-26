import type { ProductsFiltersDTO } from "@app/shared";
import { API } from "../config";



export async function fetchFilters(): Promise<ProductsFiltersDTO> {
    const res = await fetch(`${API}/products/filters`)

    if (!res.ok) {
        throw new Error(`Failed to fetch filters: ${res.status}`)
    }

    const data: ProductsFiltersDTO = await res.json()
    return data
}

