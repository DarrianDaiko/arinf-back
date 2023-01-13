/*
  Warnings:

  - You are about to drop the `Register` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `blockChainAddress` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockChainAddress" TEXT NOT NULL;

-- DropTable
DROP TABLE "Register";
