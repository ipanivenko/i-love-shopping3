import { apiFetch } from "../auth/apiFetch"
import { API } from "../config"

export type SupportTicket = {
  id: string
  subject: string
  message: string
  answer: string | null
  status: 'OPEN' | 'ANSWERED' | 'CLOSED'
  createdAt: string
  updatedAt: string
}

export type CreateSupportTicketDto = {
  name: string
  email: string
  subject: string
  message: string
}

export async function createSupportTicket(data: CreateSupportTicketDto) {
  const response = await apiFetch(`${API}/support/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Failed to send support request')
  }

  return response.json() as Promise<SupportTicket>
}

export async function getMySupportTickets(email?: string) {
  const url = email
    ? `${API}/support/tickets/my?email=${encodeURIComponent(email)}`
    : `${API}/support/tickets/my`

  const response = await apiFetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Failed to load support tickets')
  }

  return response.json() as Promise<SupportTicket[]>
}