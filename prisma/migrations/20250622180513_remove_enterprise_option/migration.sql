/*
  Warnings:

  - The values [ENTERPRISE] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.
  - The values [FILE_UPLOAD] on the enum `UsageRecordType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `transcriptionsLimit` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `transcriptionsUsed` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('FREE', 'PRO');
ALTER TABLE "Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "SubscriptionPlan_new" USING ("plan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "SubscriptionPlan_old";
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UsageRecordType_new" AS ENUM ('API_REQUEST', 'STORAGE_BYTES', 'DATA_PROCESSING');
ALTER TABLE "UsageRecord" ALTER COLUMN "type" TYPE "UsageRecordType_new" USING ("type"::text::"UsageRecordType_new");
ALTER TYPE "UsageRecordType" RENAME TO "UsageRecordType_old";
ALTER TYPE "UsageRecordType_new" RENAME TO "UsageRecordType";
DROP TYPE "UsageRecordType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "transcriptionsLimit",
DROP COLUMN "transcriptionsUsed";
