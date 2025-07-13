/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Gig` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Gig` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Gig" DROP CONSTRAINT "Gig_serviceId_fkey";

-- AlterTable
ALTER TABLE "Gig" DROP COLUMN "serviceId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
