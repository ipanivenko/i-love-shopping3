export type ProductCardColor = {
  colorName: string
  colorHex: string | null
  image: string | null
  hoverImage: string | null
}


export type ProductCardItem = {
  id: string
  slug: string
  name: string
  gender: string | null
  currency: string
  priceCents: number
  surface: string | null
  ratingAvg: number | null
  brand: string
  category: string
  image: string | null
  hoverImage: string | null
  colors: ProductCardColor[]
}

export type ProductsResponse = {
  items: ProductCardItem[]
  page: number
  pageSize: number
  total: number
}

export type ProductsQueryState = {
  brand: string[];
  gender: string[];
  surface: string[];
  ratingAvgMin?: number;
  priceMin?: number;
  priceMax?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
};

export type ProductsFilterDraft = {
  brand: string[];
  gender: string[];
  surface: string[];
  ratingAvgMin?: number;
  priceMin: string;
  priceMax: string;
};

