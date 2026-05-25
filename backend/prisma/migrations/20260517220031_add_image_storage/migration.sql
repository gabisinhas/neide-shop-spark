-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMimeType" TEXT,
ALTER COLUMN "image" SET DEFAULT '';
