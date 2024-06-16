-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "hasAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceId" TEXT;
