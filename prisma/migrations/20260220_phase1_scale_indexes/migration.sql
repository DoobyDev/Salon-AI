-- User indexes
CREATE INDEX IF NOT EXISTS "User_role_createdAt_idx" ON "User"("role", "createdAt");
CREATE INDEX IF NOT EXISTS "User_businessId_createdAt_idx" ON "User"("businessId", "createdAt");

-- Business indexes
CREATE INDEX IF NOT EXISTS "Business_createdAt_idx" ON "Business"("createdAt");
CREATE INDEX IF NOT EXISTS "Business_city_country_idx" ON "Business"("city", "country");
CREATE INDEX IF NOT EXISTS "Business_postcode_idx" ON "Business"("postcode");
CREATE INDEX IF NOT EXISTS "Business_phone_idx" ON "Business"("phone");

-- Service indexes
CREATE INDEX IF NOT EXISTS "Service_businessId_name_idx" ON "Service"("businessId", "name");

-- Booking indexes
CREATE INDEX IF NOT EXISTS "Booking_createdAt_id_idx" ON "Booking"("createdAt", "id");
CREATE INDEX IF NOT EXISTS "Booking_businessId_createdAt_id_idx" ON "Booking"("businessId", "createdAt", "id");
CREATE INDEX IF NOT EXISTS "Booking_customerEmail_createdAt_id_idx" ON "Booking"("customerEmail", "createdAt", "id");
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_id_idx" ON "Booking"("status", "createdAt", "id");
CREATE INDEX IF NOT EXISTS "Booking_businessId_date_time_status_idx" ON "Booking"("businessId", "date", "time", "status");

-- Subscription indexes
CREATE INDEX IF NOT EXISTS "Subscription_status_updatedAt_idx" ON "Subscription"("status", "updatedAt");

-- AuditLog indexes
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_createdAt_idx" ON "AuditLog"("entityType", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_actorRole_createdAt_idx" ON "AuditLog"("actorRole", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_entityId_createdAt_idx" ON "AuditLog"("entityId", "createdAt");
