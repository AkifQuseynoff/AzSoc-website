-- Run this in Supabase Dashboard → SQL Editor after the initial schema migration.

alter table public.events
  add column if not exists google_sheet_webhook_url text;
