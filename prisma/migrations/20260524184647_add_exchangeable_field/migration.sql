-- AlterTable
ALTER TABLE "books" ADD COLUMN     "exchangeable" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "page" INTEGER;
