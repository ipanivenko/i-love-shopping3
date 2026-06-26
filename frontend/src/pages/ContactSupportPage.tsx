import { useState } from 'react'
import {
  createSupportTicket,
  getMySupportTickets,
  type SupportTicket,
} from '../api/support/support'
import { BackToShoppingButton } from '../components/ui/BackToShopping'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function ContactSupportPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated, isAuthLoading } = useAuth()

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadTickets()
    }
  }, [isAuthLoading, isAuthenticated])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setSubmitting(true)

      await createSupportTicket({
        name,
        email,
        subject,
        message,
      })

      setSuccess('Your message has been sent successfully.')
      setSubject('')
      setMessage('')

      if (isAuthenticated || email.trim()) {
        await loadTickets()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function loadTickets() {
    if (!isAuthenticated && !email.trim()) return

    setError(null)

    try {
      setLoadingTickets(true)

      const data = await getMySupportTickets(
        isAuthenticated ? undefined : email.trim()
      )

      setTickets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setLoadingTickets(false)
    }
  }

  return (
    <main className="bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <BackToShoppingButton />

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Support center
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            How can we help?
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Send a message to our support team and follow your requests from the
            same page.
          </p>
        </div>

        {(success || error) && (
          <div className="mt-6">
            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
          <section className="h-fit rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-950">
                Send us a message
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Describe your question clearly so we can help faster.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <>
                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Name
                    </label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
                      placeholder="you@email.com"
                    />
                  </div>
                </>

              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
                  placeholder="Order, delivery, payment..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  rows={7}
                  className="mt-1 w-full resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
                  placeholder="Write your question here..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-950">
                    {isAuthenticated
                      ? 'Your support requests'
                      : 'Previous guest requests'}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {isAuthenticated
                      ? 'Your messages and replies from support.'
                      : 'Enter your email to find requests sent as a guest.'}
                  </p>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={loadTickets}
                    disabled={loadingTickets}
                    className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingTickets ? 'Refreshing...' : 'Refresh'}
                  </button>
                ) : (
                  <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
                      placeholder="you@email.com"
                    />

                    <button
                      type="button"
                      onClick={loadTickets}
                      disabled={loadingTickets || !email.trim()}
                      className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingTickets ? 'Searching...' : 'Find'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {loadingTickets ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-40 animate-pulse rounded-2xl bg-zinc-100"
                    />
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 text-center">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">
                      {isAuthenticated
                        ? 'No support requests yet'
                        : 'No guest requests loaded'}
                    </p>

                    <p className="mt-2 max-w-sm text-sm text-zinc-500">
                      {isAuthenticated
                        ? 'When you send a message, it will appear here.'
                        : 'Use the email field above to search your previous guest requests.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {tickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="flex min-h-[240px] flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 font-semibold text-zinc-950">
                            {ticket.subject}
                          </h3>

                          <p className="mt-1 text-xs text-zinc-400">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${ticket.status === 'ANSWERED'
                              ? 'bg-green-100 text-green-700'
                              : ticket.status === 'CLOSED'
                                ? 'bg-zinc-200 text-zinc-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                        >
                          {ticket.status === 'OPEN'
                            ? 'Waiting'
                            : ticket.status === 'ANSWERED'
                              ? 'Answered'
                              : 'Closed'}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          You
                        </p>

                        <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-zinc-700">
                          {ticket.message}
                        </p>
                      </div>

                      <div className="mt-3 flex-1 rounded-2xl bg-zinc-50 p-4">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${ticket.answer ? 'text-green-700' : 'text-amber-700'
                            }`}
                        >
                          Support
                        </p>

                        {ticket.answer ? (
                          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-zinc-700">
                            {ticket.answer}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-zinc-500">
                            Waiting for a reply.
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}