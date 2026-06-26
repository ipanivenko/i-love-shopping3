export type CartWarningReason =
  | 'SKU_NOT_FOUND'
  | 'PRODUCT_NOT_AVAILABLE'
  | 'OUT_OF_STOCK'
  | 'QUANTITY_ADJUSTED';

export type CartWarning = {
  skuId: string;
  reason: CartWarningReason;
  message: string;
};

export type CartPreviewItem = {
  skuId: string;
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  brandId: string;
  categoryId: string;
  gender: string | null;
  colorName: string;
  sizeEU: string;
  imageUrl: string | null;
  currency: string;
  priceCents: number;
  requestedQuantity: number;
  quantity: number;
  availableQuantity: number;
  lineTotalCents: number;
};

export type CartPreviewResponse = {
  items: CartPreviewItem[];
  subtotalCents: number;
  warnings: CartWarning[];
};
