-- CreateTable
CREATE TABLE "AccountingIntegration" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'not_connected',
  "accountLabel" TEXT NOT NULL DEFAULT '',
  "syncMode" TEXT NOT NULL DEFAULT 'daily',
  "connectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AccountingIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountingIntegration_businessId_provider_key" ON "AccountingIntegration"("businessId", "provider");

-- CreateIndex
CREATE INDEX "AccountingIntegration_businessId_updatedAt_idx" ON "AccountingIntegration"("businessId", "updatedAt");

-- AddForeignKey
ALTER TABLE "AccountingIntegration"
ADD CONSTRAINT "AccountingIntegration_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
