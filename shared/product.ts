export type ProductDetailsImage = {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

export type ProductDetailsSku = {
  id: string
  sizeEU: number
  sizeUS: number | null
  sizeUK: number | null
  sku: string
  barcode: string | null
  stockQty: number
}

export type ProductDetailsColor = {
  id: string
  colorName: string
  colorHex: string | null
  images: ProductDetailsImage[]
  skus: ProductDetailsSku[]
}

export type ProductDetails = {
  id: string
  slug: string
  name: string
  description: string
  currency: string
  priceCents: number

  gender: string | null
  surface: string | null

  ratingAvg: number | null
  ratingCount: number

  brand: {
    name: string
    slug: string
  }

  category: {
    name: string
    slug: string
  }

   // Weight
  weightGrams: number | null
  weightOunces: number | null

  // Dimensions - metric
  lengthMm: number | null
  widthMm: number | null
  heightMm: number | null

  // Dimensions - imperial
  lengthIn: number | null
  widthIn: number | null
  heightIn: number | null

  colors: ProductDetailsColor[]
}