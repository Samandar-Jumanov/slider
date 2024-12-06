/*
  Warnings:

  - The values [APPROVED] on the enum `AD_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AD_STATUS_new" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED');
ALTER TABLE "Ad" ALTER COLUMN "status" TYPE "AD_STATUS_new" USING ("status"::text::"AD_STATUS_new");
ALTER TYPE "AD_STATUS" RENAME TO "AD_STATUS_old";
ALTER TYPE "AD_STATUS_new" RENAME TO "AD_STATUS";
DROP TYPE "AD_STATUS_old";
COMMIT;
