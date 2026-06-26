import { useState } from "react"
import type { FilterOptionDTO } from "@app/shared"


type FilterOption = {
  label: string
  value: string
}


type ProductsFiltersSidebarProps = {
  brandOptions: FilterOptionDTO[]
  surfaceOptions: FilterOptionDTO[]
  selectedBrands?: string[]
  selectedGenders?: string[]
  selectedSurfaces?: string[]
  ratingAvgMin?: string
  priceMin?: string
  priceMax?: string
  onApply?: (filters: {
    brands: string[]
    genders: string[]
    surfaces: string[]
    rating?: number
    priceMin?: number
    priceMax?: number
  }) => void
  onClear?: () => void
}


const genderOptions: FilterOption[] = [
  { label: 'Men', value: 'MEN' },
  { label: 'Women', value: 'WOMEN' },
  { label: 'Kids', value: 'KIDS' },
]

type CheckboxGroupProps = {
  title: string
  options: FilterOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
}

function CheckboxGroup({
  title,
  options,
  selectedValues,
  onToggle,
}: CheckboxGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 rounded-xl px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => onToggle(option.value)}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function toggleValue(
  value: string,
  setValues: React.Dispatch<React.SetStateAction<string[]>>
) {
  setValues((prev) =>
    prev.includes(value)
      ? prev.filter((item) => item !== value)
      : [...prev, value]
  )
}

export default function ProductsFiltersSidebar({
  brandOptions,
  surfaceOptions,
  selectedBrands = [],
  selectedGenders = [],
  selectedSurfaces = [],
  ratingAvgMin = '',
  priceMin = '',
  priceMax = '',
  onApply,
  onClear,
}: ProductsFiltersSidebarProps
) {
  const [brands, setBrands] = useState<string[]>(selectedBrands)
  const [genders, setGenders] = useState<string[]>(selectedGenders)
  const [surfaces, setSurfaces] = useState<string[]>(selectedSurfaces)
  const [rating, setRating] = useState<string>(ratingAvgMin ?? "")
  const [priceMinim, setPriceMin] = useState<string>(priceMin ?? 0)
  const [priceMaxim, setPriceMax] = useState<string>(priceMax ?? 5)

  function handleClear() {
    setBrands([])
    setGenders([])
    setSurfaces([])
    setRating('')
    setPriceMin('')
    setPriceMax('')

    onClear?.()
  }


  return (
    <aside className="rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-zinc-200 backdrop-blur size-fit">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900">Filters</h2>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        <CheckboxGroup
          title="Brand"
          options={brandOptions}
          selectedValues={brands}
          onToggle={(value) => toggleValue(value, setBrands)}
        />

        <CheckboxGroup
          title="Gender"
          options={genderOptions}
          selectedValues={genders}
          onToggle={(value) => toggleValue(value, setGenders)}
        />

        <CheckboxGroup
          title="Surface"
          options={surfaceOptions}
          selectedValues={surfaces}
          onToggle={(value) => toggleValue(value, setSurfaces)}
        />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Rating
          </h3>

          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-400"
          >
            <option value="">Any rating</option>
            <option value="4">4★ & up</option>
            <option value="3">3★ & up</option>
            <option value="2">2★ & up</option>
          </select>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Price
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              value={priceMinim}
              onChange={(e) => setPriceMin(e.target.value)}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-400"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max"
              value={priceMaxim}
              onChange={(e) => setPriceMax(e.target.value)}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() =>
              onApply?.({
                brands,
                genders,
                surfaces,
                rating: rating ? Number(rating) : undefined,
                priceMin: priceMinim ? Number(priceMinim) : undefined,
                priceMax: priceMaxim ? Number(priceMaxim) : undefined,
              })
            }
            className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Apply filters
          </button>
        </div>
      </div>
    </aside>
  )
}