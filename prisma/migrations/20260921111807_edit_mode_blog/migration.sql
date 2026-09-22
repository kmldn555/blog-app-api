/*
  Warnings:

  - You are about to drop the column `objectId` on the `Blog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Blog_objectId_key";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "objectId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Blog_pkey" PRIMARY KEY ("id");
