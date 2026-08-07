/*
  Warnings:

  - Added the required column `uploaded_by_id` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "uploaded_by_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "media_deleted_at_idx" ON "media"("deleted_at");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
