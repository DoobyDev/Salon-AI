-- CreateTable
CREATE TABLE "WaitlistEntry" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL DEFAULT '',
  "customerEmail" TEXT,
  "service" TEXT NOT NULL DEFAULT '',
  "preferredDate" TEXT,
  "preferredTime" TEXT,
  "status" TEXT NOT NULL DEFAULT 'waiting',
  "notes" TEXT,
  "lastActionAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitlistEntry_businessId_createdAt_id_idx" ON "WaitlistEntry"("businessId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "WaitlistEntry_businessId_status_createdAt_id_idx" ON "WaitlistEntry"("businessId", "status", "createdAt", "id");

-- AddForeignKey
ALTER TABLE "WaitlistEntry"
ADD CONSTRAINT "WaitlistEntry_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
