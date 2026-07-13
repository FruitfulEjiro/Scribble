/*
  Warnings:

  - The values [DRAFT,PUBLISHED,ARCHIVED] on the enum `PostStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `category` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- AlterEnum
BEGIN;
CREATE TYPE "PostStatus_new" AS ENUM ('draft', 'published', 'archived');
ALTER TABLE "public"."Post" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "status" TYPE "PostStatus_new" USING ("status"::text::"PostStatus_new");
ALTER TYPE "PostStatus" RENAME TO "PostStatus_old";
ALTER TYPE "PostStatus_new" RENAME TO "PostStatus";
DROP TYPE "public"."PostStatus_old";
ALTER TABLE "Post" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" JSONB,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';
