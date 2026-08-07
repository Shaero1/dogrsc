-- AlterTable
CREATE TYPE "PaymentMethod" AS ENUM ('BANK', 'CRYPTO');

ALTER TABLE "donations" ADD COLUMN "payment_method" "PaymentMethod";
