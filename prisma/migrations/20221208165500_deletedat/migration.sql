/*
  Warnings:

  - You are about to alter the column `price` on the `NFT` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Real`.

*/
-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "NFT" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE REAL;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "deletedAt" TIMESTAMP(3);
