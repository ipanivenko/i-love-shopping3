import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type AdminReview = {
    id: string
    productId: string
    userId: string
    rating: number
    comment: string | null
    createdAt: string
    updatedAt: string
    product: {
        id: string
        name: string
        slug: string
    }
    user: {
        id: string
        email: string
        name: string | null
    }
    helpfulVotes?: {
        id: string
    }[]
}

export type UpdateAdminReviewDto = {
    rating?: number
    comment?: string
}

async function getResponseError(response: Response, fallback: string) {
    try {
        const error = await response.json()
        return error.message ?? fallback
    } catch {
        return fallback
    }
}

export async function getAdminReviews() {
    const response = await apiFetch(`${API}/admin/reviews`)

    if (!response.ok) {
        throw new Error(await getResponseError(response, 'Failed to load reviews'))
    }

    return response.json() as Promise<AdminReview[]>
}

export async function updateAdminReview(
    id: string,
    data: UpdateAdminReviewDto,
) {
    const response = await apiFetch(`${API}/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error(await getResponseError(response, 'Failed to update review'))
    }

    return response.json() as Promise<AdminReview>
}

export async function deleteAdminReview(id: string) {
    const response = await apiFetch(`${API}/admin/reviews/${id}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        throw new Error(await getResponseError(response, 'Failed to delete review'))
    }

    return response.json() as Promise<{ message: string }>
}