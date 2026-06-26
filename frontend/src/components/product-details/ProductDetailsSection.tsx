import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useProductDetails } from '../../api/productDetails/useProductDetails'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'
import ProductSpecs from './ProductSpecs'
import ProductDescription from './ProductDescription'
import AddToCartButton from '../cart/addToCardButton'
import SectionRow from '../ui/SectionRow'
import { ProductReviews } from '../review/ProductReviews'
import { NotFoundError } from '../../api/errors'
import NotFoundPage from '../../pages/NotFoundPage'

export default function ProductDetailsSection() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const colorFromUrl = searchParams.get('color') ?? ''

  const { product, loading, error } = useProductDetails(slug)

  const [selectedColorName, setSelectedColorName] = useState('')
  const [selectedSizeId, setSelectedSizeId] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (!product?.colors?.length) return

    const normalizedUrlColor = colorFromUrl.toLowerCase()

    if (normalizedUrlColor) {
      const matchingColor = product.colors.find(
        (color) => color.colorName.toLowerCase() === normalizedUrlColor
      )

      if (matchingColor) {
        setSelectedColorName(matchingColor.colorName)
        return
      }
    }

    setSelectedColorName(product.colors[0].colorName)
  }, [product, colorFromUrl])

  const selectedColor = useMemo(() => {
    if (!product?.colors?.length) return null

    const normalizedSelectedColor = selectedColorName.toLowerCase()

    return (
      product.colors.find(
        (color) => color.colorName.toLowerCase() === normalizedSelectedColor
      ) ?? product.colors[0]
    )
  }, [product, selectedColorName])

  const selectedSku = useMemo(() => {
    if (!selectedColor) return null

    return selectedColor.skus.find((sku) => sku.id === selectedSizeId) ?? null
  }, [selectedColor, selectedSizeId])

  useEffect(() => {
    setSelectedImageIndex(0)
    setSelectedSizeId('')
  }, [selectedColor?.colorName])

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-zinc-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Loading product...</p>
        </div>
      </section>
    )
  }

  if (error instanceof NotFoundError) {
  return (
    <NotFoundPage
      title="Product not found"
      message="This product does not exist or is no longer available."
    />
  )
}

  if (error) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-red-200 bg-red-50 p-10">
        <p className="text-sm font-medium text-red-700">
          Something went wrong. Please try again later.
        </p>
      </div>
    </section>
  )
}

  if (!product || !selectedColor) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-zinc-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Product not found.</p>
        </div>
      </section>
    )
  }

 return (
  <section className="relative overflow-hidden">
    {/* Background atmosphere */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        {/* Gallery */}
        <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-4 shadow-2xl shadow-emerald-900/5 backdrop-blur">
          <ProductGallery
            productName={product.name}
            images={selectedColor.images}
            selectedImageIndex={selectedImageIndex}
            onSelectImage={setSelectedImageIndex}
          />
        </div>

        {/* Product info */}
        <aside className="lg:sticky lg:top-24">
          <div className="space-y-4 rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-emerald-900/5 backdrop-blur">
            <ProductInfo
              product={product}
              selectedColor={selectedColor}
              selectedSku={selectedSku}
              selectedSizeId={selectedSizeId}
              onSelectColor={setSelectedColorName}
              onSelectSize={setSelectedSizeId}
            />

            <div className="pt-2">
              <AddToCartButton
                skuId={selectedSku?.id}
                disabled={!selectedSku}
              />
            </div>

            {!selectedSku && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center shadow-sm">
                <p className="text-xs font-medium text-amber-700">
                  Select your size before adding to cart.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom sections */}
      <div className="mt-16 space-y-8">
        <div className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur">
          <SectionRow title="Specifications">
            <ProductSpecs
              weightGrams={product.weightGrams}
              weightOunces={product.weightOunces}
              lengthMm={product.lengthMm}
              widthMm={product.widthMm}
              heightMm={product.heightMm}
              lengthIn={product.lengthIn}
              widthIn={product.widthIn}
              heightIn={product.heightIn}
            />
          </SectionRow>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur">
          <SectionRow title="Description">
            <ProductDescription product={product} />
          </SectionRow>
        </div>
         <ProductReviews productId={product.id} />
      </div>
    </div>
  </section>
)
}