type ProductGalleryImage = {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

type ProductGalleryProps = {
  productName: string
  images: ProductGalleryImage[]
  selectedImageIndex: number
  onSelectImage: (index: number) => void
}

export default function ProductGallery({
  productName,
  images,
  selectedImageIndex,
  onSelectImage,
}: ProductGalleryProps) {
  const selectedImage = images[selectedImageIndex] ?? images[0] ?? null

  return (
  <div className="space-y-4">
    {/* Main image */}
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-xl shadow-emerald-900/5 backdrop-blur">
      {selectedImage ? (
        <>
          <img
            src={selectedImage.url}
            alt={selectedImage.alt ?? productName}
            className="aspect-square w-full object-contain p-6 transition duration-500 group-hover:scale-[1.03]"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/5 to-transparent" />
        </>
      ) : (
        <div className="flex aspect-square flex-col items-center justify-center text-center text-zinc-500">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm">
            No image available
          </div>
        </div>
      )}
    </div>

    {/* Thumbnails */}
    {images.length > 1 && (
      <div className="rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-xl shadow-emerald-900/5 backdrop-blur">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const active = index === selectedImageIndex

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelectImage(index)}
                className={`group relative shrink-0 overflow-hidden rounded-2xl border bg-white/70 transition-all duration-200 ${
                  active
                    ? "border-zinc-950 shadow-md ring-2 ring-zinc-900/10"
                    : "border-white/70 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? `${productName} ${index + 1}`}
                  className={`h-20 w-20 object-contain p-2 transition duration-300 ${
                    active ? "scale-105" : "group-hover:scale-105"
                  }`}
                />

                <div
                  className={`absolute inset-0 transition ${
                    active
                      ? "bg-black/0"
                      : "bg-white/0 group-hover:bg-black/5"
                  }`}
                />

                {active && (
                  <div className="absolute inset-x-2 bottom-1 rounded-full bg-white/95 px-2 py-[2px] text-[10px] font-semibold text-zinc-900 shadow-sm">
                    Selected
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )}
  </div>
)
}