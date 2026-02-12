-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ShippingProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'carrier',
    "standardEmissionFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.096,
    "expressEmissionFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "overnightEmissionFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.13,
    "basePricePerKg" DOUBLE PRECISION,
    "basePricePerKm" DOUBLE PRECISION,
    "minimumCharge" DOUBLE PRECISION,
    "avgDeliveryDays" INTEGER,
    "carbonOffsetAvailable" BOOLEAN NOT NULL DEFAULT false,
    "sustainabilityRating" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingServiceLevel" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "emissionFactor" DOUBLE PRECISION NOT NULL,
    "shippingMode" TEXT NOT NULL,
    "priceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "minDeliveryDays" INTEGER,
    "maxDeliveryDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingServiceLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderShippingRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "detectedProviderName" TEXT,
    "detectedServiceLevel" TEXT,
    "matchedProviderId" TEXT,
    "shippingCost" DOUBLE PRECISION NOT NULL,
    "shippingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "carrierCode" TEXT,
    "carrierTitle" TEXT,
    "costPerKg" DOUBLE PRECISION,
    "costPerKm" DOUBLE PRECISION,
    "carbonPerDollar" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderShippingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingComparison" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderShippingRecordId" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "currentCost" DOUBLE PRECISION NOT NULL,
    "currentCO2e" DOUBLE PRECISION NOT NULL,
    "alternativeProviderId" TEXT NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "estimatedCO2e" DOUBLE PRECISION NOT NULL,
    "costSavings" DOUBLE PRECISION NOT NULL,
    "co2Savings" DOUBLE PRECISION NOT NULL,
    "costSavingsPercent" DOUBLE PRECISION NOT NULL,
    "co2SavingsPercent" DOUBLE PRECISION NOT NULL,
    "recommendationScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingOptimizationSettings" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "costWeight" INTEGER NOT NULL DEFAULT 50,
    "carbonWeight" INTEGER NOT NULL DEFAULT 50,
    "preferredProviderIds" TEXT[],
    "excludedProviderIds" TEXT[],
    "maxDeliveryDays" INTEGER,
    "requireCarbonOffset" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingOptimizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingProvider_name_key" ON "ShippingProvider"("name");

-- CreateIndex
CREATE INDEX "ShippingProvider_name_idx" ON "ShippingProvider"("name");

-- CreateIndex
CREATE INDEX "ShippingProvider_active_idx" ON "ShippingProvider"("active");

-- CreateIndex
CREATE INDEX "ShippingServiceLevel_providerId_idx" ON "ShippingServiceLevel"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingServiceLevel_providerId_code_key" ON "ShippingServiceLevel"("providerId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "OrderShippingRecord_orderId_key" ON "OrderShippingRecord"("orderId");

-- CreateIndex
CREATE INDEX "OrderShippingRecord_merchantId_idx" ON "OrderShippingRecord"("merchantId");

-- CreateIndex
CREATE INDEX "OrderShippingRecord_matchedProviderId_idx" ON "OrderShippingRecord"("matchedProviderId");

-- CreateIndex
CREATE INDEX "OrderShippingRecord_createdAt_idx" ON "OrderShippingRecord"("createdAt");

-- CreateIndex
CREATE INDEX "ShippingComparison_merchantId_idx" ON "ShippingComparison"("merchantId");

-- CreateIndex
CREATE INDEX "ShippingComparison_orderShippingRecordId_idx" ON "ShippingComparison"("orderShippingRecordId");

-- CreateIndex
CREATE INDEX "ShippingComparison_createdAt_idx" ON "ShippingComparison"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingOptimizationSettings_merchantId_key" ON "ShippingOptimizationSettings"("merchantId");

-- AddForeignKey
ALTER TABLE "ShippingServiceLevel" ADD CONSTRAINT "ShippingServiceLevel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ShippingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderShippingRecord" ADD CONSTRAINT "OrderShippingRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderShippingRecord" ADD CONSTRAINT "OrderShippingRecord_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderShippingRecord" ADD CONSTRAINT "OrderShippingRecord_matchedProviderId_fkey" FOREIGN KEY ("matchedProviderId") REFERENCES "ShippingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingComparison" ADD CONSTRAINT "ShippingComparison_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingComparison" ADD CONSTRAINT "ShippingComparison_orderShippingRecordId_fkey" FOREIGN KEY ("orderShippingRecordId") REFERENCES "OrderShippingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingComparison" ADD CONSTRAINT "ShippingComparison_alternativeProviderId_fkey" FOREIGN KEY ("alternativeProviderId") REFERENCES "ShippingProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOptimizationSettings" ADD CONSTRAINT "ShippingOptimizationSettings_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
