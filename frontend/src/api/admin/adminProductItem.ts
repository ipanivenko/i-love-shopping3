import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"
import type { Product } from "../../types/adminProduct"
import { NotFoundError } from "../errors"

export async function getAdminProduct(id: string): Promise<Product> {
    const response = await apiFetch(`${API}/admin/products/${id}`)

    if (response.status === 404) {
        throw new NotFoundError('Product not found')
    }

    if (!response.ok) {
        throw new Error('Failed to load product')
    }

    return response.json()
}

export async function createAdminProductColor(
    productId: string,
    data: {
        colorName: string
        colorHex: string
    },
) {
    const response = await apiFetch(`${API}/admin/products/${productId}/colors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error('Create color backend error:', errorText)
        throw new Error(errorText || 'Failed to create color')
    }

    return response.json()
}

export async function updateAdminProductColor(
    colorId: string,
    data: {
        colorName?: string
        colorHex?: string
    },
) {
    return apiFetch(`${API}/admin/products/colors/${colorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export async function deleteAdminProductColor(colorId: string) {
    return apiFetch(`${API}/admin/products/colors/${colorId}`, {
        method: 'DELETE',
    })
}

export async function createAdminProductSku(
    colorId: string,
    data: {
        sizeEU: string
        sizeUS?: string
        sizeUK?: string
        barcode?: string
        stockQty: number
    },
) {
    return apiFetch(`${API}/admin/products/colors/${colorId}/skus`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}

export async function updateAdminProductColorImage(
    imageId: string,
    data: {
        alt?: string
        sortOrder?: number
    },
) {
    return apiFetch(`${API}/admin/products/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export async function deleteAdminProductColorImage(imageId: string) {
    return apiFetch(`${API}/admin/products/images/${imageId}`, {
        method: 'DELETE',
    })
}

export async function uploadAdminProductColorImage(
    colorId: string,
    data: {
        image: File
        alt?: string
        sortOrder: number
    },
) {
    const formData = new FormData()

    formData.append('image', data.image)
    formData.append('sortOrder', String(data.sortOrder))

    if (data.alt) {
        formData.append('alt', data.alt)
    }

    return apiFetch(`${API}/admin/products/colors/${colorId}/images`, {
        method: 'POST',
        body: formData,
    })
}

export async function updateAdminProductSku(
    skuId: string,
    data: {
        sizeEU?: string
        sizeUS?: string
        sizeUK?: string
        barcode?: string | null
        stockQty?: number
    },
) {
    return apiFetch(`${API}/admin/products/skus/${skuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export async function deleteAdminProductSku(skuId: string) {
    return apiFetch(`${API}/admin/products/skus/${skuId}`, {
        method: 'DELETE',
    })

}