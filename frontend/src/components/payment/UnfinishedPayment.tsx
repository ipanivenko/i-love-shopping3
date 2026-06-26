import { CreditCard, Clock3, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type ResumePaymentBannerProps = {
  orderId: string
  remainingTime?: string
}

export function ResumePaymentBanner({
  orderId,
  remainingTime,
}: ResumePaymentBannerProps) {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50/70 p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700 shadow-sm">
            <CreditCard className="h-5 w-5" />
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-sm font-semibold text-zinc-900">
              Unfinished payment
            </p>

            <span className="hidden h-5 w-px bg-amber-200 sm:block" />

            <p className="text-sm text-zinc-600">
              Complete your order before it expires.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:shrink-0">
          {remainingTime && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
              <Clock3 className="h-4 w-4" />
              {remainingTime}
            </div>
          )}

          <Link
            to={`/payment/${orderId}`}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
          >
            Finish payment
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}