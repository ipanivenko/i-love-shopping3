/*
  Warnings:

  - You are about to drop the column `email` on the `PasswordResetToken` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `PasswordResetToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PasswordResetToken_email_token_key";

-- DropIndex
DROP INDEX "PasswordResetToken_token_key";

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP COLUMN "email",
DROP COLUMN "token",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "requestedIp" TEXT,
ADD COLUMN     "tokenHash" TEXT NOT NULL,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
