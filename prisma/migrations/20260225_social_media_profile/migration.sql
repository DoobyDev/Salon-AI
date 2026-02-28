-- CreateTable
CREATE TABLE "SocialMediaProfile" (
  "businessId" TEXT NOT NULL,
  "customSocial" TEXT NOT NULL DEFAULT '',
  "socialImageUrl" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SocialMediaProfile_pkey" PRIMARY KEY ("businessId")
);

-- AddForeignKey
ALTER TABLE "SocialMediaProfile"
ADD CONSTRAINT "SocialMediaProfile_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
