/*
  Warnings:

  - You are about to alter the column `balance` on the `Team` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Real`.

*/
-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE REAL;
