/*
  Warnings:

  - You are about to drop the column `provider` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `dbUri` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackingId]` on the table `App` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dbType` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedDbUri` to the `App` table without a default value. This is not possible if the table is not empty.
  - The required column `trackingId` was added to the `App` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `token` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DbType" AS ENUM ('POSTGRES', 'MONGODB');

-- DropIndex
DROP INDEX "Account_provider_accountId_key";

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "provider",
DROP COLUMN "providerAccountId",
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "App" DROP COLUMN "dbUri",
ADD COLUMN     "dbType" "DbType" NOT NULL,
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "encryptedDbUri" TEXT NOT NULL,
ADD COLUMN     "trackingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expires",
DROP COLUMN "sessionToken",
ALTER COLUMN "token" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "App_trackingId_key" ON "App"("trackingId");

-- CreateIndex
CREATE INDEX "App_userId_idx" ON "App"("userId");

-- CreateIndex
CREATE INDEX "App_trackingId_idx" ON "App"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
