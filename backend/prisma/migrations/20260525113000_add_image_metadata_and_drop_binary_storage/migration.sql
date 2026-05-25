ALTER TABLE "Product"
ADD COLUMN "imageStorageProvider" TEXT,
ADD COLUMN "imageStorageKey" TEXT,
ADD COLUMN "imageContentType" TEXT,
ADD COLUMN "imageUploadedAt" TIMESTAMP(3);

UPDATE "Product"
SET
  "imageStorageProvider" = CASE
    WHEN "image" LIKE '%amazonaws.com/%' THEN 's3'
    WHEN "image" LIKE '/assets/%' OR "image" LIKE '%/assets/%' THEN 'local'
    ELSE NULL
  END,
  "imageStorageKey" = CASE
    WHEN "image" LIKE '/assets/uploads/%' THEN REPLACE("image", '/assets/uploads/', '')
    WHEN "image" LIKE '%/assets/uploads/%' THEN SPLIT_PART("image", '/assets/uploads/', 2)
    WHEN "image" LIKE '/assets/%' THEN REPLACE("image", '/assets/', '')
    WHEN "image" LIKE '%amazonaws.com/%' THEN SPLIT_PART("image", '.com/', 2)
    ELSE NULL
  END,
  "imageContentType" = CASE
    WHEN "image" LIKE '%.png' THEN 'image/png'
    WHEN "image" LIKE '%.jpg' OR "image" LIKE '%.jpeg' THEN 'image/jpeg'
    ELSE NULL
  END,
  "imageUploadedAt" = NOW()
WHERE "image" IS NOT NULL AND "image" <> '';

ALTER TABLE "Product"
DROP COLUMN IF EXISTS "imageData",
DROP COLUMN IF EXISTS "imageMimeType";
