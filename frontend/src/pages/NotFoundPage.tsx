import { Link } from 'react-router-dom'
import { ArrowLeft, Leaf, ShoppingBag } from 'lucide-react'

type NotFoundPageProps = {
  title?: string
  message?: string
}

export default function NotFoundPage({
  title = 'Page not found',
  message = "Oops! The page you're looking for doesn't exist or may have been moved.",
}: NotFoundPageProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-12">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-emerald-100/50">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-10 text-center text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Leaf className="h-10 w-10" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100">
            Error 404
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            {title}
          </h1>
        </div>

        <div className="px-8 py-10 text-center">
          <p className="mx-auto max-w-md text-lg leading-relaxed text-zinc-600">
            {message}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue shopping
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3 font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
          </div>

          <div className="mt-10 rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm text-emerald-800">
              Lost your way? Browse our collection or visit the FAQ if you need assistance.
            </p>

            <div className="mt-3 flex justify-center gap-6 text-sm font-medium">
              <Link
                to="/faq"
                className="text-emerald-700 hover:text-emerald-900"
              >
                FAQ
              </Link>

              <Link
                to="/contact"
                className="text-emerald-700 hover:text-emerald-900"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}