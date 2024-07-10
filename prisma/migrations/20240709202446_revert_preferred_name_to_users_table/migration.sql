/*
  Warnings:

  - You are about to drop the column `preferredName` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredName" TEXT;

-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "preferredName";
