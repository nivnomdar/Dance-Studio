-- Create table for per-class trial usage tracking
create table if not exists public.user_trial_classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  used_at timestamptz not null default now(),
  constraint user_trial_classes_user_class_unique unique (user_id, class_id)
);

-- Enable Row Level Security
alter table public.user_trial_classes enable row level security;

-- Policies: allow users to manage their own records; admins can manage all
create policy if not exists "Allow select own or admin"
on public.user_trial_classes for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy if not exists "Allow insert own or admin"
on public.user_trial_classes for insert
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy if not exists "Allow delete own or admin"
on public.user_trial_classes for delete
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Optional: restrict updates to admins only (no need to update normally)
create policy if not exists "Allow admin update"
on public.user_trial_classes for update
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);


