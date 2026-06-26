export interface UserDTO {
    id: string;
    email: string;
    name?: string;
    isTwoFactorEnabled: boolean;
}
export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
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
}
export interface PaginatedResponseDTO<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
}
