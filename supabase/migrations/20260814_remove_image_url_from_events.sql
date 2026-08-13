-- Migration: Remove legacy image_url column from events
-- Run the UP section to drop the column. Run the DOWN section to add it back.

-- Up
BEGIN;
ALTER TABLE public.events
  DROP COLUMN IF EXISTS image_url;
COMMIT;

-- Down
BEGIN;
ALTER TABLE public.events
  ADD COLUMN image_url text;
COMMIT;
