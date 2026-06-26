type SectionRowProps = {
  title: string
  children: React.ReactNode
}

export default function SectionRow({ title, children }: SectionRowProps) {
  return (
    <div className="grid gap-6 py-8 border-t border-zinc-200 lg:grid-cols-[220px_1fr]">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {title}
        </h3>
      </div>

      <div>{children}</div>
    </div>
  )
}