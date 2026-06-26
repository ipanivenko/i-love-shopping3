/*
  Warnings:

  - You are about to drop the column `isTwoFactorEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTwoFactorEnabled",
DROP COLUMN "twoFactorSecret",
ADD COLUMN     "twoFactorConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorSecretEncrypted" TEXT;
