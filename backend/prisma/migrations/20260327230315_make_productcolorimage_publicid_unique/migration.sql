/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `ProductColorImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProductColorImage_publicId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ProductColorImage_publicId_key" ON "ProductColorImage"("publicId");
