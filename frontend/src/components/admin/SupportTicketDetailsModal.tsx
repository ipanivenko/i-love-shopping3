import { useEffect, useState } from 'react'
import {
    addSupportTicketToFaq,
    answerSupportTicket,
    closeSupportTicket,
    reopenSupportTicket,
    type SupportTicket,
} from '../../api/support/support-admin'
import { SupportTicketStatusBadge } from './SupportTicketStatusBadge'



type Props = {
    ticket: SupportTicket | null
    onClose: () => void
    onTicketUpdated: (ticket: SupportTicket) => void
}

export function SupportTicketDetailsModal({
    ticket,
    onClose,
    onTicketUpdated,
}: Props) {
    const [answer, setAnswer] = useState('')
    const [loading, setLoading] = useState(false)
    const [pageError, setPageError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [faqModalOpen, setFaqModalOpen] = useState(false)

    useEffect(() => {
        setAnswer(ticket?.answer ?? '')
        setPageError(null)
        setSuccess(null)
    }, [ticket])

    if (!ticket) return null

    async function handleAnswerTicket() {
        try {
            setLoading(true)
            setPageError(null)
            setSuccess(null)

            if (!ticket) return

            const updatedTicket = await answerSupportTicket(ticket.id, answer)

            onTicketUpdated(updatedTicket)
            setSuccess('Ticket answered successfully.')
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to answer ticket',
            )
        } finally {
            setLoading(false)
        }
    }

    async function handleCloseTicket() {
        try {
            setLoading(true)
            setPageError(null)
            setSuccess(null)

            if (!ticket) return

            const updatedTicket = await closeSupportTicket(ticket.id)

            onTicketUpdated(updatedTicket)
            setSuccess('Ticket closed.')
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to close ticket',
            )
        } finally {
            setLoading(false)
        }
    }

    async function handleReopenTicket() {
        try {
            setLoading(true)
            setPageError(null)
            setSuccess(null)

            if (!ticket) return

            const updatedTicket = await reopenSupportTicket(ticket.id)

            onTicketUpdated(updatedTicket)
            setSuccess('Ticket reopened.')
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Failed to reopen ticket',
            )
        } finally {
            setLoading(false)
        }
    }


    async function handleAddToFaq() {
        try {
            setLoading(true)
            setPageError(null)
            setSuccess(null)

            if (!ticket) return

            await addSupportTicketToFaq(ticket.id)

            setFaqModalOpen(false)

            setSuccess('Added to FAQ successfully.')
        } catch (error) {
            setPageError(
                error instanceof Error
                    ? error.message
                    : 'Failed to add ticket to FAQ',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-950">
                            {ticket.subject}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            From {ticket.name} · {ticket.email}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <SupportTicketStatusBadge status={ticket.status} />

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-3 py-1 text-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {pageError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {pageError}
                    </div>
                )}

                {success && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </div>
                )}

                <section className="mt-5 rounded-2xl bg-zinc-50 p-4">
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Customer message
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                        {ticket.message}
                    </p>
                </section>

                <section className="mt-5">
                    <label className="text-sm font-semibold text-zinc-900">
                        Support answer
                    </label>

                    <textarea
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        rows={6}
                        disabled={ticket.status === 'CLOSED'}
                        className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 disabled:bg-zinc-100"
                        placeholder="Write the answer to the customer..."
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleAnswerTicket}
                            disabled={loading || ticket.status === 'CLOSED'}
                            className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                            Save answer
                        </button>

                        {ticket.status === 'CLOSED' ? (
                            <button
                                type="button"
                                onClick={handleReopenTicket}
                                disabled={loading}
                                className="rounded-2xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                            >
                                Reopen ticket
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleCloseTicket}
                                disabled={loading}
                                className="rounded-2xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                            >
                                Close ticket
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setFaqModalOpen(true)}
                            disabled={!ticket.answer || loading}
                            className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                            Add to FAQ
                        </button>
                    </div>
                </section>
            </div>

            {
                faqModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-zinc-950">
                                Add this answer to FAQ?
                            </h3>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-zinc-500">
                                        Question
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-800">
                                        {ticket.message}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase text-zinc-500">
                                        Answer
                                    </p>

                                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
                                        {ticket.answer}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFaqModalOpen(false)}
                                    className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddToFaq}
                                    disabled={loading}
                                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}