-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "bookid" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_bookid_fkey" FOREIGN KEY ("bookid") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
