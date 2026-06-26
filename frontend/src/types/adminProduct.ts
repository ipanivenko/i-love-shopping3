type ProductImage = {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

type ProductSku = {
  id: string
  sizeEU: string
  sizeUS: string | null
  sizeUK: string | null
  sku: string
  barcode: string | null
  stockQty: number
}

type ProductColor = {
  id: string
  colorName: string
  colorHex: string | null
  images: ProductImage[]
  skus: ProductSku[]
}

export type Product = {
  id: string
  name: string
  slug?: string
  colors: ProductColor[]
}