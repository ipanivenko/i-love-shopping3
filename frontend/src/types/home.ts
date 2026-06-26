export type HomeCategory = {
  id: string
  title: string
  subtitle: string
  image: string
  href: string
}

export type HomeProduct = {
  id: string
  brand: string
  name: string
  price: string
  badge?: string
  image: string
  href: string
}

export type HomeBrand = {
  id: string
  name: string
  logo: string
  href: string
}