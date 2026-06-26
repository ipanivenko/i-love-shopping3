type CheckoutStepProps = {
  number: number
  title: string
  isOpen: boolean
  isCompleted?: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function CheckoutStep({
  number,
  title,
  isOpen,
  isCompleted = false,
  onToggle,
  children,
}: CheckoutStepProps) {
  return (
  <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-xl shadow-emerald-900/5 backdrop-blur transition-all duration-300">
    <div className="flex w-full items-center justify-between gap-4 p-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg transition-all duration-300 ${
            isCompleted
              ? "bg-emerald-600 shadow-emerald-600/20"
              : isOpen
              ? "bg-zinc-950 shadow-zinc-900/20"
              : "bg-zinc-400 shadow-zinc-400/20"
          }`}
        >
          {isCompleted ? "✓" : number}
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Checkout step
          </p>

          <h2 className="mt-1 text-lg font-black tracking-tight text-zinc-950">
            {title}
          </h2>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          isOpen
            ? "bg-zinc-950 text-white shadow-lg shadow-zinc-900/20"
            : "border border-white/70 bg-white/70 text-zinc-600 shadow-sm hover:bg-white hover:text-zinc-950"
        }`}
      >
        {isOpen ? "Close" : "Edit"}
      </button>
    </div>

    {isOpen && (
      <div className="border-t border-white/60 bg-white/40 p-6 backdrop-blur">
        {children}
      </div>
    )}
  </section>
)
}