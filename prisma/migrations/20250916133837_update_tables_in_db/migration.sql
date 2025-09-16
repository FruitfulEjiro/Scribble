/*
  Warnings:

  - You are about to drop the `GroupPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserGroupPost` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('regular', 'groupPost');

-- DropForeignKey
ALTER TABLE "public"."UserGroupPost" DROP CONSTRAINT "UserGroupPost_groupPostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserGroupPost" DROP CONSTRAINT "UserGroupPost_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "type" "public"."PostType" NOT NULL;

-- DropTable
DROP TABLE "public"."GroupPost";

-- DropTable
DROP TABLE "public"."UserGroupPost";

-- DropEnum
DROP TYPE "public"."PostRole";

-- CreateTable
CREATE TABLE "public"."PostContributors" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostContributors_pkey" PRIMARY KEY ("userId","postId")
);

-- AddForeignKey
ALTER TABLE "public"."PostContributors" ADD CONSTRAINT "PostContributors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostContributors" ADD CONSTRAINT "PostContributors_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
