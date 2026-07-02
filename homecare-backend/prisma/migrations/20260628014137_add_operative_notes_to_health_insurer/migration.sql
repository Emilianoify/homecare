/*
  Warnings:

  - A unique constraint covering the columns `[companyId,cuit]` on the table `health_insurers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `health_insurers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "health_insurers_cuit_key";

-- AlterTable
ALTER TABLE "health_insurers" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "operativeNotes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "health_insurers_companyId_cuit_key" ON "health_insurers"("companyId", "cuit");

-- AddForeignKey
ALTER TABLE "health_insurers" ADD CONSTRAINT "health_insurers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
