/*
  Warnings:

  - Added the required column `title` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `author` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "author",
ADD COLUMN     "author" UUID NOT NULL;
