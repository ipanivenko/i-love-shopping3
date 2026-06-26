import type { SupportTicketStatus } from '../../api/support/support-admin'

type Props = {
    status: SupportTicketStatus
}

export function SupportTicketStatusBadge({ status }: Props) {
    const styles: Record<SupportTicketStatus, string> = {
        OPEN: 'bg-amber-50 text-amber-700 ring-amber-200',
        ANSWERED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        CLOSED: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
    }

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
        >
            {status}
        </span>
    )
}