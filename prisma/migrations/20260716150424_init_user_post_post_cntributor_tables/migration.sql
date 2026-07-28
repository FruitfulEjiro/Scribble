-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ContributorRole" AS ENUM ('owner', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('technology', 'web_development', 'programming', 'ai_machine_learning', 'cybersecurity', 'data_science', 'mobile_development', 'open_source', 'gadgets_reviews', 'startups', 'business', 'marketing', 'entrepreneurship', 'personal_finance', 'investing', 'cryptocurrency', 'real_estate', 'career_productivity', 'remote_work', 'ecommerce', 'health_wellness', 'fitness', 'mental_health', 'food_recipes', 'travel', 'fashion_beauty', 'home_diy', 'parenting', 'relationships', 'self_improvement', 'minimalism', 'sustainability', 'design', 'photography', 'writing_books', 'art', 'music', 'film_tv', 'gaming', 'pop_culture', 'automotive', 'crafts_hobbies', 'education', 'science', 'history', 'politics', 'philosophy', 'nature', 'religion_spirituality', 'opinion_editorial');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstname" VARCHAR(32) NOT NULL,
    "lastname" VARCHAR(32) NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "image" JSONB,
    "password" VARCHAR(255),
    "passwordChangedAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" TEXT[],
    "googleSignIn" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "content" TEXT[],
    "coverImage" JSONB,
    "status" "PostStatus" NOT NULL DEFAULT 'published',
    "readTime" INTEGER,
    "tags" TEXT[],
    "category" "Category" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostContributors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "role" "ContributorRole" NOT NULL DEFAULT 'editor',
    "invitedAt" TIMESTAMP(3) NOT NULL,
    "AcceptedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostContributors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_refreshToken_key" ON "User"("refreshToken");

-- CreateIndex
CREATE INDEX "Post_tags_idx" ON "Post" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "Post_category_createdAt_idx" ON "Post"("category", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostContributors_userId_postId_key" ON "PostContributors"("userId", "postId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContributors" ADD CONSTRAINT "PostContributors_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContributors" ADD CONSTRAINT "PostContributors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
