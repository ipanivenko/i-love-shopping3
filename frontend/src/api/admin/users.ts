import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type UserRole = 'USER' | 'SUPPORT' | 'ADMIN'

export type AdminUser = {
    id: string
    email: string
    name: string | null
    role: UserRole
    image: string | null
    isVerified: boolean
    twoFactorConfirmedAt: string | null
    createdAt: string
    updatedAt: string

    fullName: string | null
    phone: string | null
    address: string | null
    city: string | null
    postcode: string | null
    country: string | null

    _count: {
        orders: number
        reviews: number
        sessions: number
    }
}

export type UpdateUserRoleDto = {
    role: UserRole
}

export async function getAdminUsers() {
    const response = await apiFetch(`${API}/admin/users`)

    return response.json() as Promise<AdminUser[]>
}

export async function getAdminUser(id: string) {
    const response = await apiFetch(`${API}/admin/users/${id}`)

    return response.json() as Promise<AdminUser>
}

export async function updateAdminUserRole(
    id: string,
    data: UpdateUserRoleDto,
) {
    const response = await apiFetch(`${API}/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()

        if (
            error.message ===
            'This user must enable 2FA before becoming admin or support'
        ) {
            throw new Error(
                'Cannot assign ADMIN or SUPPORT role because this user has not enabled two-factor authentication.'
            )
        }

        throw new Error(error.message ?? 'Failed to update role')
    }

    return response.json() as Promise<AdminUser>
}