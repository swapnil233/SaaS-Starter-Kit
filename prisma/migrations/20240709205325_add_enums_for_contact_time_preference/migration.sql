/*
  Warnings:

  - The `contactTimePreference` column on the `UserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ContactTimePreference" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "darkMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "contactTimePreference",
ADD COLUMN     "contactTimePreference" "ContactTimePreference";
