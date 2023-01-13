-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_collectionId_fkey";

-- AlterTable
ALTER TABLE "NFT" ALTER COLUMN "collectionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
