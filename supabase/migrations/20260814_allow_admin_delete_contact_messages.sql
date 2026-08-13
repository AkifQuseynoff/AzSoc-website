-- Allow admins to delete contact messages
-- Run this once in Supabase Dashboard → SQL Editor or via CLI

create policy "Admins delete contact messages" on public.contact_messages
  for delete
  using (public.is_admin());
