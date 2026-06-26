type ProductsPaginationProps = {
  page: number
  totalPages: number
  onPageChange?: (page: number) => void
}

export default function ProductsPagination({
  page,
  totalPages,
  onPageChange,
}: ProductsPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange?.(page - 1)}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Prev
      </button>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange?.(pageNumber)}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            pageNumber === page
              ? 'bg-zinc-900 text-white'
              : 'border border-zinc-200 bg-white text-zinc-700 hover:scale-110'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange?.(page + 1)}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  )
}