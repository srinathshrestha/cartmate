-- Add pendingEmail and emailVerificationSentAt to users
ALTER TABLE "users"
ADD COLUMN "pending_email" TEXT,
ADD COLUMN "email_verification_sent_at" TIMESTAMP;

-- Ensure pending_email is unique when present
CREATE UNIQUE INDEX "users_pending_email_key" ON "users"("pending_email") WHERE "pending_email" IS NOT NULL;

-- Backfill: set pending_email to NULL explicitly
UPDATE "users" SET "pending_email" = NULL WHERE "pending_email" IS NOT NULL;

