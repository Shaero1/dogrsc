-- AlterTable
ALTER TABLE "dogs" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "dogs_is_published_status_idx" ON "dogs"("is_published", "status");
