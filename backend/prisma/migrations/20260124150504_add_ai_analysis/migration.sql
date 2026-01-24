-- DropForeignKey
ALTER TABLE "MediaEvidence" DROP CONSTRAINT "MediaEvidence_reportId_fkey";

-- AlterTable
ALTER TABLE "MediaEvidence" ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" TEXT,
ALTER COLUMN "reportId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MediaEvidence" ADD CONSTRAINT "MediaEvidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
