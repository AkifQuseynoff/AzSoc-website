-- Run this in Supabase Dashboard → SQL Editor after the initial schema migration.

create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.committee_members (name, role, display_order)
select seed.name, seed.role, seed.display_order
from (values
  ('Leyla Hasanova', 'President', 1),
  ('Elçin Mammadov', 'Vice President', 2),
  ('Nigar Aliyeva', 'Events Director', 3),
  ('Kamran Huseynov', 'Treasurer', 4),
  ('Aynur Qasımova', 'Social Secretary', 5),
  ('Tural Rzayev', 'Outreach Officer', 6)
) as seed(name, role, display_order)
where not exists (select 1 from public.committee_members);

alter table public.committee_members enable row level security;
-- Ensure policies are idempotent when running migrations multiple times
drop policy if exists "Public can read committee members" on public.committee_members;
drop policy if exists "Admins manage committee members" on public.committee_members;

create policy "Public can read committee members"
  on public.committee_members for select using (true);

create policy "Admins manage committee members"
  on public.committee_members for all
  using (public.is_admin()) with check (public.is_admin());
