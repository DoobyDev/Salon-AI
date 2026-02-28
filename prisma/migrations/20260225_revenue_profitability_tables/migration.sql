-- CreateTable
CREATE TABLE "RevenueSpendChannel" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "spend" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RevenueSpendChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitabilityConfig" (
  "businessId" TEXT NOT NULL,
  "rent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "utilities" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "software" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "other" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "cogsPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProfitabilityConfig_pkey" PRIMARY KEY ("businessId")
);

-- CreateTable
CREATE TABLE "ProfitabilityPayrollEntry" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "staffName" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT '',
  "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProfitabilityPayrollEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevenueSpendChannel_businessId_channel_key" ON "RevenueSpendChannel"("businessId", "channel");

-- CreateIndex
CREATE INDEX "RevenueSpendChannel_businessId_updatedAt_idx" ON "RevenueSpendChannel"("businessId", "updatedAt");

-- CreateIndex
CREATE INDEX "ProfitabilityPayrollEntry_businessId_updatedAt_id_idx" ON "ProfitabilityPayrollEntry"("businessId", "updatedAt", "id");

-- AddForeignKey
ALTER TABLE "RevenueSpendChannel"
ADD CONSTRAINT "RevenueSpendChannel_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitabilityConfig"
ADD CONSTRAINT "ProfitabilityConfig_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitabilityPayrollEntry"
ADD CONSTRAINT "ProfitabilityPayrollEntry_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
