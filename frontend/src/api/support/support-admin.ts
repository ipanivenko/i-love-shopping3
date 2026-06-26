import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type SupportTicketStatus = 'OPEN' | 'ANSWERED' | 'CLOSED'

export type SupportTicket = {
    id: string
    userId?: string | null
    name: string
    email: string
    subject: string
    message: string
    answer?: string | null
    status: SupportTicketStatus
    createdAt: string
    updatedAt: string
    user?: {
        id: string
        email: string
        name?: string | null
    } | null
}

export async function getSupportTickets() {
    const response = await apiFetch(`${API}/support-admin/tickets`)

    if (!response.ok) {
        throw new Error('Failed to fetch support tickets')
    }

    return response.json() as Promise<SupportTicket[]>
}

export async function getSupportTicketById(id: string) {
    const response = await apiFetch(`${API}/support-admin/tickets/${id}`)

    if (!response.ok) {
        throw new Error('Failed to fetch support ticket')
    }

    return response.json() as Promise<SupportTicket>
}

export async function answerSupportTicket(id: string, answer: string) {
    const response = await apiFetch(`${API}/support-admin/tickets/${id}/answer`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to answer support ticket')
    }

    return response.json() as Promise<SupportTicket>
}

export async function closeSupportTicket(id: string) {
    const response = await apiFetch(`${API}/support-admin/tickets/${id}/close`, {
        method: 'PATCH',
    })

    if (!response.ok) {
        throw new Error('Failed to close support ticket')
    }

    return response.json() as Promise<SupportTicket>
}

export async function reopenSupportTicket(id: string) {
    const response = await apiFetch(`${API}/support-admin/tickets/${id}/reopen`, {
        method: 'PATCH',
    })

    if (!response.ok) {
        throw new Error('Failed to reopen support ticket')
    }

    return response.json() as Promise<SupportTicket>
}

export async function addSupportTicketToFaq(id: string) {
    const response = await apiFetch(
        `${API}/support-admin/tickets/${id}/add-to-faq`,
        {
            method: 'POST',
        },
    )

    if (!response.ok) {
        const error = await response.json()

        throw new Error(error.message ?? 'Failed to add ticket to FAQ')
    }

    return response.json()
}