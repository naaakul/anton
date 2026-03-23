/*
  Warnings:

  - You are about to drop the column `provider` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "provider",
DROP COLUMN "providerAccountId";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "sessionToken";

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
