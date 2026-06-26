import { useEffect, useState } from 'react'
import { getFaqs, type FaqItem } from '../api/support/faq'
import { BackToShoppingButton } from '../components/ui/BackToShopping'

export default function FaqPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [pageError, setPageError] = useState('')

    useEffect(() => {
        async function loadFaqs() {
            try {
                setIsLoading(true)
                setPageError('')

                const data = await getFaqs()
                setFaqs(data)
            } catch (error) {
                setPageError(
                    error instanceof Error ? error.message : 'Failed to load FAQs',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadFaqs()
    }, [])

    return (
        <main className="mx-auto max-w-3xl px-4 py-10">
            <BackToShoppingButton label="Continue shopping" />
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-950">
                    Frequently Asked Questions
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    Find quick answers about orders, delivery, refunds and support.
                </p>
            </div>

            {isLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    Loading FAQs...
                </div>
            )}

            {pageError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {pageError}
                </div>
            )}

            {!isLoading && !pageError && faqs.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    No FAQs available yet.
                </div>
            )}

            {!isLoading && !pageError && faqs.length > 0 && (
                <section className="space-y-4">
                    {faqs.map((faq) => (
                        <details
                            key={faq.id}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <summary className="cursor-pointer list-none font-semibold text-slate-950">
                                <div className="flex items-center justify-between gap-4">
                                    <span>{faq.question}</span>
                                    <span className="text-xl text-slate-400 group-open:rotate-45">
                                        +
                                    </span>
                                </div>
                            </summary>

                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </section>
            )}
        </main>
    )
}