-- CreateEnum
CREATE TYPE "ContributorStatus" AS ENUM ('pending', 'active');

-- AlterTable
ALTER TABLE "PostContributors" ADD COLUMN     "status" "ContributorStatus" NOT NULL DEFAULT 'pending';
