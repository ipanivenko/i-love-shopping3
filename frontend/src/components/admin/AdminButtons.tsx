import { Link } from 'react-router'

export function BackToDashboardButton() {
  return (
    <Link
      to="/admin"
      className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
    >
      ← Back to Dashboard
    </Link>
  )
}

export function BackToProductsButton() {
  return (
    <Link
      to="/admin/products"
      className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
    >
      ← Back to Products
    </Link>
  )
}