/*
  Warnings:

  - You are about to drop the column `hasUsedTrial` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastActiveAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hasUsedTrial",
DROP COLUMN "image",
DROP COLUMN "lastActiveAt",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "timezone";

-- DropTable
DROP TABLE "Notification";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "Role";
