-- CreateTable
CREATE TABLE "StaffRosterMember" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'staff',
  "availability" TEXT NOT NULL DEFAULT 'off_duty',
  "shiftDays" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StaffRosterMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffRotaWeek" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "weekStart" TEXT NOT NULL,
  "cells" JSONB,
  "sicknessLogs" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StaffRotaWeek_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffRosterMember_businessId_updatedAt_id_idx" ON "StaffRosterMember"("businessId", "updatedAt", "id");

-- CreateIndex
CREATE INDEX "StaffRotaWeek_businessId_updatedAt_idx" ON "StaffRotaWeek"("businessId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaffRotaWeek_businessId_weekStart_key" ON "StaffRotaWeek"("businessId", "weekStart");

-- AddForeignKey
ALTER TABLE "StaffRosterMember"
ADD CONSTRAINT "StaffRosterMember_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffRotaWeek"
ADD CONSTRAINT "StaffRotaWeek_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
