/*
  Warnings:

  - The values [writer] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserType_new" AS ENUM ('admin', 'author', 'user');
ALTER TABLE "public"."User" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "userType" TYPE "public"."UserType_new" USING ("userType"::text::"public"."UserType_new");
ALTER TYPE "public"."UserType" RENAME TO "UserType_old";
ALTER TYPE "public"."UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
ALTER TABLE "public"."User" ALTER COLUMN "userType" SET DEFAULT 'user';
COMMIT;
