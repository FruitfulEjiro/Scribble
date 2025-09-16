/*
  Warnings:

  - Added the required column `role` to the `UserGroupPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PostRole" AS ENUM ('author', 'contributor');

-- AlterTable
ALTER TABLE "public"."UserGroupPost" ADD COLUMN     "role" "public"."PostRole" NOT NULL;
