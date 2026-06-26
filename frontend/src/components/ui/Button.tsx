import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition'

  const styles =
    variant === 'primary'
    ? 'bg-black text-white hover:opacity-90'
    : 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50'

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}