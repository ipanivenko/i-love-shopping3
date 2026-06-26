-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'UNISEX', 'KIDS');

-- CreateEnum
CREATE TYPE "ShoeSurface" AS ENUM ('ROAD', 'TRAIL', 'INDOOR', 'TRACK', 'ALL_TERRAIN');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "priceCents" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "gender" "Gender",
    "surface" "ShoeSurface",
    "ratingAvg" DECIMAL(3,2),
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB,
    "weightGrams" INTEGER,
    "weightOunces" INTEGER,
    "lengthMm" INTEGER,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "lengthIn" DECIMAL(6,2),
    "widthIn" DECIMAL(6,2),
    "heightIn" DECIMAL(6,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductColorImage" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT NOT NULL DEFAULT 'cloudinary',
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductColorImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSku" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "sizeEU" DECIMAL(4,1) NOT NULL,
    "sizeUS" DECIMAL(4,1),
    "sizeUK" DECIMAL(4,1),
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "stockQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSku_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_slug_idx" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_gender_idx" ON "Product"("gender");

-- CreateIndex
CREATE INDEX "Product_surface_idx" ON "Product"("surface");

-- CreateIndex
CREATE INDEX "Product_priceCents_idx" ON "Product"("priceCents");

-- CreateIndex
CREATE INDEX "ProductColor_productId_idx" ON "ProductColor"("productId");

-- CreateIndex
CREATE INDEX "ProductColor_colorName_idx" ON "ProductColor"("colorName");

-- CreateIndex
CREATE UNIQUE INDEX "ProductColor_productId_colorName_key" ON "ProductColor"("productId", "colorName");

-- CreateIndex
CREATE INDEX "ProductColorImage_colorId_idx" ON "ProductColorImage"("colorId");

-- CreateIndex
CREATE INDEX "ProductColorImage_colorId_sortOrder_idx" ON "ProductColorImage"("colorId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductColorImage_publicId_idx" ON "ProductColorImage"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSku_sku_key" ON "ProductSku"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSku_barcode_key" ON "ProductSku"("barcode");

-- CreateIndex
CREATE INDEX "ProductSku_colorId_idx" ON "ProductSku"("colorId");

-- CreateIndex
CREATE INDEX "ProductSku_sizeEU_idx" ON "ProductSku"("sizeEU");

-- CreateIndex
CREATE INDEX "ProductSku_stockQty_idx" ON "ProductSku"("stockQty");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSku_colorId_sizeEU_key" ON "ProductSku"("colorId", "sizeEU");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColor" ADD CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColorImage" ADD CONSTRAINT "ProductColorImage_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSku" ADD CONSTRAINT "ProductSku_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
