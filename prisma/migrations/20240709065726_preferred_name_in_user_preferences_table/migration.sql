/*
  Warnings:

  - You are about to drop the column `preferredName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "preferredName";

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "preferredName" TEXT;
