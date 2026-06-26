// User response shared between React and NestJS
export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  isTwoFactorEnabled: boolean;
}

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface ProductListColorDTO {
  colorName: string;
  colorHex: string | null;
  image: string | null;
  hoverImage: string | null;
}

export interface ProductListItemDTO {
  id: string;
  slug: string;
  name: string;
  gender: string | null;
  currency: string;
  priceCents: number;
  surface: string | null;
  ratingAvg: number | null;
  brand: string;
  category: string;
  image: string | null;
  hoverImage: string | null;
  colors: ProductListColorDTO[];
}

export interface PaginatedResponseDTO<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface FilterOptionDTO {
  label: string
  value: string
}

export interface ProductsFiltersDTO {
  brands: FilterOptionDTO[]
  surfaces: FilterOptionDTO[]
}