-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
