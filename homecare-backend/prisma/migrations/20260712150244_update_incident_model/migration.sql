/*
  Warnings:

  - You are about to drop the column `actionTaken` on the `incidents` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToId` on the `incidents` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `incidents` table. All the data in the column will be lost.
  - You are about to drop the column `closedAt` on the `incidents` table. All the data in the column will be lost.
  - You are about to drop the column `incidentDate` on the `incidents` table. All the data in the column will be lost.
  - Added the required column `occurredAt` to the `incidents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `incidents` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `severity` on the `incidents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('FALL', 'MEDICATION_ERROR', 'CLINICAL', 'ADMINISTRATIVE', 'PROFESSIONAL', 'LOGISTIC', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
ALTER TYPE "IncidentStatus" ADD VALUE 'IN_REVIEW';

-- DropForeignKey
ALTER TABLE "incidents" DROP CONSTRAINT "incidents_assignedToId_fkey";

-- AlterTable
ALTER TABLE "incidents" DROP COLUMN "actionTaken",
DROP COLUMN "assignedToId",
DROP COLUMN "category",
DROP COLUMN "closedAt",
DROP COLUMN "incidentDate",
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "type" "IncidentType" NOT NULL,
DROP COLUMN "severity",
ADD COLUMN     "severity" "IncidentSeverity" NOT NULL;

-- DropEnum
DROP TYPE "IncidentCategory";

-- DropEnum
DROP TYPE "Severity";
