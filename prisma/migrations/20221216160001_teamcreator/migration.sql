/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Team_creatorId_key" ON "Team"("creatorId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
