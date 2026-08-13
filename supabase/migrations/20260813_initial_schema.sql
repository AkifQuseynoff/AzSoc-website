-- Run this once in Supabase Dashboard → SQL Editor.
-- Profiles are created automatically for every registered auth user.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  date text not null,
  location text not null default '',
  tag text not null default 'Social',
  tag_color text not null default '#c0392b',
  image_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  year text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.contact_messages enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Public can read events" on public.events for select using (true);
create policy "Admins manage events" on public.events for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins read profiles" on public.profiles for select using (public.is_admin());
create policy "Admins update profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can send a contact message" on public.contact_messages for insert with check (true);
create policy "Admins read contact messages" on public.contact_messages for select using (public.is_admin());

-- After creating your own account, run this once to make it the initial admin:
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
