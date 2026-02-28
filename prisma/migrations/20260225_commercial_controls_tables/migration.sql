-- CreateTable
CREATE TABLE "CommercialMembership" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
  "status" TEXT NOT NULL DEFAULT 'active',
  "benefits" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CommercialMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialPackage" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sessionCount" INTEGER NOT NULL DEFAULT 1,
  "remainingSessions" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CommercialPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialGiftCard" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "purchaserName" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "initialBalance" DOUBLE PRECISION NOT NULL,
  "remainingBalance" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CommercialGiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommercialMembership_businessId_updatedAt_id_idx" ON "CommercialMembership"("businessId", "updatedAt", "id");

-- CreateIndex
CREATE INDEX "CommercialPackage_businessId_updatedAt_id_idx" ON "CommercialPackage"("businessId", "updatedAt", "id");

-- CreateIndex
CREATE INDEX "CommercialGiftCard_businessId_issuedAt_id_idx" ON "CommercialGiftCard"("businessId", "issuedAt", "id");

-- CreateIndex
CREATE INDEX "CommercialGiftCard_businessId_status_updatedAt_id_idx" ON "CommercialGiftCard"("businessId", "status", "updatedAt", "id");

-- AddForeignKey
ALTER TABLE "CommercialMembership"
ADD CONSTRAINT "CommercialMembership_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialPackage"
ADD CONSTRAINT "CommercialPackage_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialGiftCard"
ADD CONSTRAINT "CommercialGiftCard_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
