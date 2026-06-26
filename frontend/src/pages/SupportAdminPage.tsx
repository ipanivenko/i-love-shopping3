import { useEffect, useMemo, useState } from 'react'
import {
  getSupportTickets,
  type SupportTicket,
  type SupportTicketStatus,
} from '../api/support/support-admin'
import { SupportTicketList } from '../components/admin/SupportTicketsList'
import { SupportTicketDetailsModal } from '../components/admin/SupportTicketDetailsModal'
import { useAuth } from '../context/AuthContext'

const statuses: Array<'ALL' | SupportTicketStatus> = [
  'ALL',
  'OPEN',
  'ANSWERED',
  'CLOSED',
]

export default function SupportAdminPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [openedTicket, setOpenedTicket] = useState<SupportTicket | null>(null)
  const [statusFilter, setStatusFilter] =
    useState<'ALL' | SupportTicketStatus>('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const { isAuthLoading } = useAuth()

  async function loadTickets() {
    try {
      setLoading(true)
      setPageError(null)

      const data = await getSupportTickets()
      setTickets(data)
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Failed to load tickets',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading) {
      loadTickets()
    }
  }, [isAuthLoading])

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === 'ALL' || ticket.status === statusFilter

      const value = search.trim().toLowerCase()

      const matchesSearch =
        !value ||
        ticket.subject.toLowerCase().includes(value) ||
        ticket.message.toLowerCase().includes(value) ||
        ticket.email.toLowerCase().includes(value) ||
        ticket.name.toLowerCase().includes(value)

      return matchesStatus && matchesSearch
    })
  }, [tickets, statusFilter, search])

  function handleTicketUpdated(updatedTicket: SupportTicket) {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket,
      ),
    )

    setOpenedTicket(updatedTicket)
  }

  if (isAuthLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-zinc-500">Page is loading...</p>
      </main>
    )
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">
            Support tickets
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Answer customer questions and add useful answers to FAQ.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTickets}
          disabled={loading}
          className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {pageError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <section className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by subject, message, name or email..."
          className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'ALL' | SupportTicketStatus)
          }
          className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
          Loading tickets...
        </div>
      ) : (
        <SupportTicketList
          tickets={filteredTickets}
          onOpenTicket={setOpenedTicket}
        />
      )}

      <SupportTicketDetailsModal
        ticket={openedTicket}
        onClose={() => setOpenedTicket(null)}
        onTicketUpdated={handleTicketUpdated}
      />
    </main>
  )
}