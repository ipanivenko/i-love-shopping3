import type { SupportTicket } from '../../api/support/support-admin'
import { SupportTicketStatusBadge } from './SupportTicketStatusBadge'

type Props = {
  tickets: SupportTicket[]
  onOpenTicket: (ticket: SupportTicket) => void
}

export function SupportTicketList({ tickets, onOpenTicket }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        No support tickets found.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="hidden grid-cols-[1fr_220px_120px_120px] gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-zinc-500 md:grid">
        <span>Question</span>
        <span>Customer</span>
        <span>Status</span>
        <span></span>
      </div>

      <div className="divide-y divide-zinc-200">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_220px_120px_120px] md:items-center"
          >
            <div>
              <h3 className="font-semibold text-zinc-950">
                {ticket.subject}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                {ticket.message}
              </p>
            </div>

            <div className="text-sm text-zinc-600">
              <p className="font-medium text-zinc-800">{ticket.name}</p>
              <p className="break-all text-zinc-500">{ticket.email}</p>
            </div>

            <SupportTicketStatusBadge status={ticket.status} />

            <button
              type="button"
              onClick={() => onOpenTicket(ticket)}
              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}