/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `archivedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `attributes` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "archivedAt",
ADD COLUMN     "status" "BrandStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "archivedAt",
ADD COLUMN     "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "attributes";
