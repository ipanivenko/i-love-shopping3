-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "customerRatingAvg" DECIMAL(3,2),
ADD COLUMN     "customerReviewCount" INTEGER NOT NULL DEFAULT 0;
