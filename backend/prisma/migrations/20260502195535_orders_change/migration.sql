/*
  Warnings:

  - You are about to drop the column `address1` on the `OrderShippingAddress` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `OrderShippingAddress` table. All the data in the column will be lost.
  - Added the required column `address` to the `OrderShippingAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderShippingAddress" DROP COLUMN "address1",
DROP COLUMN "address2",
ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postcode" TEXT;
