-- Migration: Re-add `image_url` column to `events` (restore schema)
-- Up: add column if missing
BEGIN;
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS image_url text;
COMMIT;

-- Down: remove column if present
BEGIN;
ALTER TABLE public.events
  DROP COLUMN IF EXISTS image_url;
COMMIT;
