-- CreateTable
CREATE TABLE "stories" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "dog_id" UUID,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stories_slug_key" ON "stories"("slug");

-- CreateIndex
CREATE INDEX "stories_is_published_published_at_idx" ON "stories"("is_published", "published_at" DESC);

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
