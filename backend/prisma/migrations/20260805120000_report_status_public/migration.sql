-- ReportStatus: PENDING/APPROVED/REJECTED -> ACTIVE/HIDDEN/VERIFIED

CREATE TYPE "ReportStatus_new" AS ENUM ('ACTIVE', 'HIDDEN', 'VERIFIED');

ALTER TABLE "found_reports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "lost_reports" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "found_reports"
  ALTER COLUMN "status" TYPE "ReportStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'ACTIVE'::"ReportStatus_new"
      WHEN 'APPROVED' THEN 'ACTIVE'::"ReportStatus_new"
      WHEN 'REJECTED' THEN 'HIDDEN'::"ReportStatus_new"
    END
  );

ALTER TABLE "lost_reports"
  ALTER COLUMN "status" TYPE "ReportStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'ACTIVE'::"ReportStatus_new"
      WHEN 'APPROVED' THEN 'ACTIVE'::"ReportStatus_new"
      WHEN 'REJECTED' THEN 'HIDDEN'::"ReportStatus_new"
    END
  );

DROP TYPE "ReportStatus";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";

ALTER TABLE "found_reports" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "lost_reports" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

CREATE INDEX "found_reports_status_created_at_idx" ON "found_reports"("status", "created_at");
CREATE INDEX "lost_reports_status_created_at_idx" ON "lost_reports"("status", "created_at");
