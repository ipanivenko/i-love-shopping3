import type { ProductDetailsColor } from '@app/shared/product'

type ProductColorPickerProps = {
  colors: ProductDetailsColor[]
  selectedColorName: string
  onSelectColor: (colorName: string) => void
}

export default function ProductColorPicker({
  colors,
  selectedColorName,
  onSelectColor,
}: ProductColorPickerProps) {
  const normalizedSelected = selectedColorName?.toLowerCase() ?? ''

  const selectedColor =
    colors.find((color) => color.colorName.toLowerCase() === normalizedSelected) ?? colors[0] ?? null

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="font-medium text-zinc-900">Color</p>

      <div className="mt-3 flex flex-wrap gap-3">
        {colors.map((color) => {
          const active = color.colorName.toLowerCase() === normalizedSelected


          return (
            <button
              key={color.colorName}
              type="button"
              onClick={() => onSelectColor(color.colorName.toLowerCase())}
              aria-label={color.colorName}
              title={color.colorName}
              className={`h-9 w-9 rounded-full border-2 transition ${active ?
                  'scale-110 border-black ring-2 ring-black'
                  : 'border-zinc-300'
                }`}
              style={{ backgroundColor: color.colorHex ?? '#d4d4d8' }}
            />
          )
        })}
      </div>

      <p className="mt-3 text-sm text-zinc-600">
        {selectedColor?.colorName ?? 'No color selected'}
      </p>
    </div>
  )
}