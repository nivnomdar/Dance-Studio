-- Create table for contact messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied')),
  user_id uuid references auth.users(id) on delete set null,
  replied_by uuid references auth.users(id) on delete set null,
  replied_at timestamptz,
  source_ip text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful index
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages(status);

-- Trigger to keep updated_at fresh
create or replace function public.set_timestamp_contact_messages()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_contact_messages on public.contact_messages;
create trigger set_timestamp_contact_messages
before update on public.contact_messages
for each row execute procedure public.set_timestamp_contact_messages();

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Policies
-- Allow anonymous inserts (site visitors)
drop policy if exists contact_messages_insert_anonymous on public.contact_messages;
create policy contact_messages_insert_anonymous
on public.contact_messages
for insert
to anon
with check (true);

-- Allow authenticated users to insert as well
drop policy if exists contact_messages_insert_auth on public.contact_messages;
create policy contact_messages_insert_auth
on public.contact_messages
for insert
to authenticated
with check (true);

-- Allow admins to select all rows
drop policy if exists contact_messages_select_admin on public.contact_messages;
create policy contact_messages_select_admin
on public.contact_messages
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Allow admins to update any row (e.g., mark as read/replied)
drop policy if exists contact_messages_update_admin on public.contact_messages;
create policy contact_messages_update_admin
on public.contact_messages
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);


