-- AlterTable
ALTER TABLE "NFT" ADD COLUMN     "previousOwnersId" INTEGER[];

-- CreateTable
CREATE TABLE "_previousOwners" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_previousOwners_AB_unique" ON "_previousOwners"("A", "B");

-- CreateIndex
CREATE INDEX "_previousOwners_B_index" ON "_previousOwners"("B");

-- AddForeignKey
ALTER TABLE "_previousOwners" ADD CONSTRAINT "_previousOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "NFT"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_previousOwners" ADD CONSTRAINT "_previousOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
