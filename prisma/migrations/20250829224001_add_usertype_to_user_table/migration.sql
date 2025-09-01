-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('admin', 'writer', 'user');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "userType" "public"."UserType" NOT NULL DEFAULT 'user';
