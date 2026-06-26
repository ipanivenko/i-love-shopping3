import { Link } from 'react-router'

type BackToShoppingButtonProps = {
  label?: string
}

export function BackToShoppingButton({
  label = 'Back to shopping',
}: BackToShoppingButtonProps) {
  return (
    <Link
      to="/products"
      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition hover:text-zinc-900"
    >
      ← {label}
    </Link>
  )
}