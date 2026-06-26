type ProductSpecsProps = {
    weightGrams: number | null
    weightOunces: number | null
    lengthMm: number | null
    widthMm: number | null
    heightMm: number | null
    lengthIn: number | null
    widthIn: number | null
    heightIn: number | null
}

function formatMetricDimensions(
    lengthMm: number | null,
    widthMm: number | null,
    heightMm: number | null
) {
    if (lengthMm == null || widthMm == null || heightMm == null) return null
    return `${lengthMm} × ${widthMm} × ${heightMm} mm`
}

function formatImperialDimensions(
    lengthIn: number | null,
    widthIn: number | null,
    heightIn: number | null
) {
    if (lengthIn == null || widthIn == null || heightIn == null) return null
    return `${lengthIn} × ${widthIn} × ${heightIn} in`
}

export default function ProductSpecs({
    weightGrams,
    weightOunces,
    lengthMm,
    widthMm,
    heightMm,
    lengthIn,
    widthIn,
    heightIn,
}: ProductSpecsProps) {
    const metricDimensions = formatMetricDimensions(lengthMm, widthMm, heightMm)
    const imperialDimensions = formatImperialDimensions(lengthIn, widthIn, heightIn)

    const hasWeight = weightGrams != null || weightOunces != null
    const hasDimensions = metricDimensions || imperialDimensions

    if (!hasWeight && !hasDimensions) return null

    return (
  <div className="grid gap-5 sm:grid-cols-2">
    {hasWeight && (
      <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl transition-all duration-300 group-hover:scale-125" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6 text-emerald-700"
              >
                <path d="M6 7h12" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                <path d="M5 7l1 12h12l1-12" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Product Details
              </p>

              <h3 className="text-xl font-black tracking-tight text-zinc-950">
                Weight
              </h3>
            </div>
          </div>

          <div className="mt-6 h-px w-full bg-gradient-to-r from-emerald-200 via-zinc-200 to-transparent" />

          <div className="mt-6 space-y-2">
            {weightGrams != null && (
              <p className="text-4xl font-black tracking-tight text-zinc-950">
                {weightGrams}

                <span className="ml-2 text-base font-semibold text-zinc-500">
                  g
                </span>
              </p>
            )}

            {weightOunces != null && (
              <p className="text-sm font-medium text-zinc-500">
                {weightOunces} oz
              </p>
            )}
          </div>
        </div>
      </div>
    )}

    {hasDimensions && (
      <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-teal-200/30 blur-2xl transition-all duration-300 group-hover:scale-125" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6 text-teal-700"
              >
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Product Details
              </p>

              <h3 className="text-xl font-black tracking-tight text-zinc-950">
                Dimensions
              </h3>
            </div>
          </div>

          <div className="mt-6 h-px w-full bg-gradient-to-r from-teal-200 via-zinc-200 to-transparent" />

          <div className="mt-6 space-y-2">
            {metricDimensions && (
              <p className="text-2xl font-black tracking-tight text-zinc-950">
                {metricDimensions}
              </p>
            )}

            {imperialDimensions && (
              <p className="text-sm font-medium text-zinc-500">
                {imperialDimensions}
              </p>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)
}