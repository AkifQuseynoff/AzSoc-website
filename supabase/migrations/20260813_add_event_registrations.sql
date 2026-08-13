-- Run this in Supabase Dashboard → SQL Editor after the initial schema migration.

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_registrations enable row level security;

create policy "Members read their registrations"
  on public.event_registrations for select using (auth.uid() = user_id);

create policy "Admins read all registrations"
  on public.event_registrations for select using (public.is_admin());

create policy "Members register themselves"
  on public.event_registrations for insert with check (auth.uid() = user_id);

create policy "Members cancel their registrations"
  on public.event_registrations for delete using (auth.uid() = user_id);

create policy "Admins manage registrations"
  on public.event_registrations for all using (public.is_admin()) with check (public.is_admin());
