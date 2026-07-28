/*
  Warnings:

  - You are about to drop the column `AcceptedAt` on the `PostContributors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostContributors" DROP COLUMN "AcceptedAt",
ADD COLUMN     "acceptedAt" TIMESTAMP(3);
