/*
  Warnings:

  - You are about to drop the `Database` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Database" DROP CONSTRAINT "Database_userId_fkey";

-- DropTable
DROP TABLE "Database";
