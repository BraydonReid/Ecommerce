/*
  Warnings:

  - Added the required column `updatedAt` to the `MerchantSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "MerchantSettings" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "defaultShippingMode" TEXT NOT NULL DEFAULT 'road',
ADD COLUMN     "trackingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
