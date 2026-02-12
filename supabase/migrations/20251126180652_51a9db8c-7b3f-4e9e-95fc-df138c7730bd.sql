-- Migration: Update app_link in products table to remove /app/ prefix
-- This updates existing links from /app/{slug} to /{slug}

UPDATE products
SET app_link = REPLACE(app_link, '/app/', '/')
WHERE app_link LIKE '%/app/%';