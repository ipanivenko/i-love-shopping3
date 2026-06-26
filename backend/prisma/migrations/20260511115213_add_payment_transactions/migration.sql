-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL');

-- CreateEnum
CREATE TYPE "PaymentTransactionType" AS ENUM ('PAYMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "type" "PaymentTransactionType" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "providerPaymentId" TEXT,
    "providerChargeId" TEXT,
    "cardBrand" TEXT,
    "cardLast4" TEXT,
    "receiptUrl" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "parentTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentTransaction_orderId_idx" ON "PaymentTransaction"("orderId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_parentTransactionId_idx" ON "PaymentTransaction"("parentTransactionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_provider_providerPaymentId_idx" ON "PaymentTransaction"("provider", "providerPaymentId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_providerChargeId_idx" ON "PaymentTransaction"("providerChargeId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
