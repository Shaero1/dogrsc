-- CryptoAddress: flexible currency codes + one displayed address per currency on public site

ALTER TABLE "crypto_addresses" ADD COLUMN "currency_code" VARCHAR(16);
ALTER TABLE "crypto_addresses" ADD COLUMN "label" VARCHAR(64);
ALTER TABLE "crypto_addresses" ADD COLUMN "is_displayed" BOOLEAN NOT NULL DEFAULT false;

UPDATE "crypto_addresses" SET "currency_code" = "currency"::text;

ALTER TABLE "crypto_addresses" ALTER COLUMN "currency_code" SET NOT NULL;

UPDATE "crypto_addresses" SET "is_displayed" = false;

WITH "ranked" AS (
  SELECT "id",
         ROW_NUMBER() OVER (
           PARTITION BY "currency_code"
           ORDER BY "created_at" DESC
         ) AS "rn"
  FROM "crypto_addresses"
  WHERE "is_active" = true
)
UPDATE "crypto_addresses" AS "ca"
SET "is_displayed" = true
FROM "ranked" AS "r"
WHERE "ca"."id" = "r"."id" AND "r"."rn" = 1;

UPDATE "crypto_addresses" SET "is_displayed" = false WHERE "is_active" = false;

DROP INDEX IF EXISTS "crypto_addresses_currency_is_active_idx";

ALTER TABLE "crypto_addresses" DROP COLUMN "currency";

CREATE INDEX "crypto_addresses_currency_code_is_active_idx"
  ON "crypto_addresses"("currency_code", "is_active");

CREATE UNIQUE INDEX "crypto_one_displayed_per_currency"
  ON "crypto_addresses"("currency_code")
  WHERE "is_active" = true AND "is_displayed" = true;

DROP TYPE "CryptoCurrency";
