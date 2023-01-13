/*
  Warnings:

  - You are about to alter the column `price` on the `Sell` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Real`.

*/
-- AlterTable
ALTER TABLE "Sell" ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE REAL;
