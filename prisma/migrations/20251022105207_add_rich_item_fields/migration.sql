-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'PURCHASED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ItemPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('PIECE', 'PACK', 'DOZEN', 'G', 'KG', 'OZ', 'ML', 'L', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('DAIRY', 'GRAINS', 'PRODUCE', 'MEAT', 'BEVERAGE', 'HOUSEHOLD', 'OTHER');

-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_uses" INTEGER,
ADD COLUMN     "used_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "assigned_to_id" TEXT,
ADD COLUMN     "category" "ItemCategory",
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "customUnit" TEXT,
ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priceCents" INTEGER,
ADD COLUMN     "priority" "ItemPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "purchased_at" TIMESTAMP(3),
ADD COLUMN     "purchased_by_id" TEXT,
ADD COLUMN     "purchased_price_cents" INTEGER,
ADD COLUMN     "quantityNumber" DECIMAL(10,2),
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'TODO',
ADD COLUMN     "storeAisle" TEXT,
ADD COLUMN     "storeName" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "unit" "Unit" NOT NULL DEFAULT 'PIECE';

-- AlterTable
ALTER TABLE "lists" ADD COLUMN     "member_cap" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "sub_items" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_attachments" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sub_items_item_id_idx" ON "sub_items"("item_id");

-- CreateIndex
CREATE INDEX "item_attachments_item_id_idx" ON "item_attachments"("item_id");

-- CreateIndex
CREATE INDEX "item_attachments_uploaded_by_idx" ON "item_attachments"("uploaded_by");

-- CreateIndex
CREATE INDEX "otp_codes_user_id_idx" ON "otp_codes"("user_id");

-- CreateIndex
CREATE INDEX "otp_codes_email_idx" ON "otp_codes"("email");

-- CreateIndex
CREATE INDEX "otp_codes_code_idx" ON "otp_codes"("code");

-- CreateIndex
CREATE INDEX "otp_codes_expires_at_idx" ON "otp_codes"("expires_at");

-- CreateIndex
CREATE INDEX "invites_is_active_idx" ON "invites"("is_active");

-- CreateIndex
CREATE INDEX "items_status_idx" ON "items"("status");

-- CreateIndex
CREATE INDEX "items_priority_idx" ON "items"("priority");

-- CreateIndex
CREATE INDEX "items_dueAt_idx" ON "items"("dueAt");

-- CreateIndex
CREATE INDEX "items_assigned_to_id_idx" ON "items"("assigned_to_id");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_purchased_by_id_fkey" FOREIGN KEY ("purchased_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_items" ADD CONSTRAINT "sub_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attachments" ADD CONSTRAINT "item_attachments_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attachments" ADD CONSTRAINT "item_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
