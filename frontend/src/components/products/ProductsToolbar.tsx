type SortOption = {
  label: string
  value: string
}

type ProductsToolbarProps = {
  total?: number
  query?: string
  sortValue: string
  onSortChange?: (value: string) => void
}

export default function ProductsToolbar({
  total = 0,
  query,
  sortValue,
  onSortChange,
}: ProductsToolbarProps) {
  const sortOptions: SortOption[] = query?.trim()
    ? [
        { label: 'Relevance', value: 'relevance' },
        { label: 'Newest first', value: 'newest-desc' },
        { label: 'Price: low to high', value: 'price-asc' },
        { label: 'Price: high to low', value: 'price-desc' },
        { label: 'Rating: high to low', value: 'rating-desc' },
      ]
    : [
        { label: 'Newest first', value: 'newest-desc' },
        { label: 'Price: low to high', value: 'price-asc' },
        { label: 'Price: high to low', value: 'price-desc' },
        { label: 'Rating: high to low', value: 'rating-desc' },
      ]

  return (
    <section className="mb-6 rounded-[2rem] bg-white/80 p-4 shadow-sm ring-1 ring-zinc-200 backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {query?.trim() ? `Results for "${query}"` : 'All products'}
          </p>
          <h2 className="text-xl font-bold text-zinc-900">
            {total} product{total !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-sm font-medium text-zinc-700">
            Sort by
          </label>

          <select
            id="sort"
            value={sortValue}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-400"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}