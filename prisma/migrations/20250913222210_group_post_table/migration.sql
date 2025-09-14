/*
  Warnings:

  - Added the required column `category` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "public"."GroupPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "category" TEXT NOT NULL,

    CONSTRAINT "GroupPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserGroupPost" (
    "userId" TEXT NOT NULL,
    "groupPostId" TEXT NOT NULL,

    CONSTRAINT "UserGroupPost_pkey" PRIMARY KEY ("userId","groupPostId")
);

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGroupPost" ADD CONSTRAINT "UserGroupPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGroupPost" ADD CONSTRAINT "UserGroupPost_groupPostId_fkey" FOREIGN KEY ("groupPostId") REFERENCES "public"."GroupPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
