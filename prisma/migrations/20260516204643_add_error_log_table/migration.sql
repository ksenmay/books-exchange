/*
  Warnings:

  - You are about to drop the column `authorsNames` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `books` table. All the data in the column will be lost.
  - The `condition` column on the `books` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `bookId` on the `exchanges` table. All the data in the column will be lost.
  - You are about to drop the column `operationType` on the `exchanges` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `exchanges` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `exchanges` table. All the data in the column will be lost.
  - The `status` column on the `exchanges` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `bookId` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `userInfo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userid,bookid]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "bookcondition" AS ENUM ('new', 'medium', 'with_a_defect', 'old');

-- CreateEnum
CREATE TYPE "exchangestatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "operationtype" AS ENUM ('sale', 'exchange');

-- CreateEnum
CREATE TYPE "userrole" AS ENUM ('admin', 'default_user');

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "exchanges" DROP CONSTRAINT "exchanges_bookId_fkey";

-- DropForeignKey
ALTER TABLE "exchanges" DROP CONSTRAINT "exchanges_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "exchanges" DROP CONSTRAINT "exchanges_senderId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_bookId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_userId_fkey";

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_bookId_fkey";

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_userId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_bookId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "userInfo" DROP CONSTRAINT "userInfo_userId_fkey";

-- DropIndex
DROP INDEX "uniqueFavorites";

-- AlterTable
ALTER TABLE "books" DROP COLUMN "authorsNames",
DROP COLUMN "createdAt",
DROP COLUMN "ownerId",
ADD COLUMN     "authorsnames" VARCHAR(255),
ADD COLUMN     "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ownerid" INTEGER,
DROP COLUMN "condition",
ADD COLUMN     "condition" "bookcondition";

-- AlterTable
ALTER TABLE "exchanges" DROP COLUMN "bookId",
DROP COLUMN "operationType",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "bookid" INTEGER,
ADD COLUMN     "operationtype" "operationtype",
ADD COLUMN     "receiverid" INTEGER,
ADD COLUMN     "senderid" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "exchangestatus";

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "bookId",
DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "bookid" INTEGER,
ADD COLUMN     "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userid" INTEGER;

-- AlterTable
ALTER TABLE "quotes" DROP COLUMN "bookId",
DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "bookid" INTEGER,
ADD COLUMN     "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userid" INTEGER;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "bookId",
DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "bookid" INTEGER,
ADD COLUMN     "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userid" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
ADD COLUMN     "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "userInfo";

-- DropEnum
DROP TYPE "bookCondition";

-- DropEnum
DROP TYPE "exchangeStatus";

-- DropEnum
DROP TYPE "operationType";

-- DropEnum
DROP TYPE "userRole";

-- CreateTable
CREATE TABLE "userinfo" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER,
    "role" "userrole" DEFAULT 'default_user',
    "email" VARCHAR(100),
    "fullname" VARCHAR(100),
    "location" VARCHAR(100),
    "avatarurl" VARCHAR(255),
    "rating" REAL DEFAULT 0,

    CONSTRAINT "userinfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uniquefavorites" ON "favorites"("userid", "bookid");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "fkbooksowner" FOREIGN KEY ("ownerid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "fkexchangesbook" FOREIGN KEY ("bookid") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "fkexchangesreceiver" FOREIGN KEY ("receiverid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "fkexchangessender" FOREIGN KEY ("senderid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "fkfavoritesbook" FOREIGN KEY ("bookid") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "fkfavoritesuser" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "fkquotesbook" FOREIGN KEY ("bookid") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "fkquotesuser" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "fkreviewsbook" FOREIGN KEY ("bookid") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "fkreviewsuser" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userinfo" ADD CONSTRAINT "fkuserinfouser" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
