-- CreateEnum
CREATE TYPE "AlertTriggerType" AS ENUM ('NO_VISIT', 'AUTHORIZATION_EXPIRING', 'NO_CLINICAL_NOTE', 'CRITICAL_INCIDENT_UNRESOLVED', 'NO_FUNCTIONAL_STATUS');

-- DropForeignKey
ALTER TABLE "alert_configs" DROP CONSTRAINT "alert_configs_branchId_fkey";

-- AlterTable
ALTER TABLE "alert_configs" DROP COLUMN "alertType",
DROP COLUMN "branchId",
DROP COLUMN "daysInAdvance",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "notifyRoles" JSONB NOT NULL,
ADD COLUMN     "thresholdDays" INTEGER NOT NULL,
ADD COLUMN     "triggerType" "AlertTriggerType" NOT NULL;

-- DropEnum
DROP TYPE "AlertType";

-- CreateIndex
CREATE UNIQUE INDEX "alert_configs_companyId_triggerType_key" ON "alert_configs"("companyId", "triggerType") WHERE "active" = true AND "deletedAt" IS NULL;
