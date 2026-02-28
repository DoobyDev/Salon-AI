-- CreateTable
CREATE TABLE "BusinessReportEmailQueueItem" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "recipientEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "report" JSONB NOT NULL,
  "queuedAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "requestedBy" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BusinessReportEmailQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessReportEmailQueueItem_businessId_queuedAt_id_idx" ON "BusinessReportEmailQueueItem"("businessId", "queuedAt", "id");

-- CreateIndex
CREATE INDEX "BusinessReportEmailQueueItem_businessId_status_queuedAt_id_idx" ON "BusinessReportEmailQueueItem"("businessId", "status", "queuedAt", "id");

-- AddForeignKey
ALTER TABLE "BusinessReportEmailQueueItem"
ADD CONSTRAINT "BusinessReportEmailQueueItem_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
