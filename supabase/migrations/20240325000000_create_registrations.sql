-- Create function to handle updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create registrations table
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  experience text,
  selected_date date not null,
  selected_time text not null,
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.registrations enable row level security;

-- Create policies for registrations

-- Users can view their own registrations
create policy "Users can view their own registrations."
  on registrations for select
  using ( auth.uid() = user_id );

-- Authenticated users can create registrations
create policy "Authenticated users can create registrations."
  on registrations for insert
  with check ( 
    auth.uid() = user_id 
    and auth.uid() is not null
  );

-- Users can update their own registrations
create policy "Users can update their own registrations."
  on registrations for update
  using ( auth.uid() = user_id );

-- Users can delete their own registrations
create policy "Users can delete their own registrations."
  on registrations for delete
  using ( auth.uid() = user_id );

-- Admins can view all registrations
create policy "Admins can view all registrations."
  on registrations for select
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Admins can manage all registrations
create policy "Admins can manage all registrations."
  on registrations for all
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Create trigger for updated_at
create trigger handle_registrations_updated_at
  before update on public.registrations
  for each row
  execute procedure public.handle_updated_at();

-- Create indexes for better performance
create index idx_registrations_user_id on public.registrations(user_id);
create index idx_registrations_class_id on public.registrations(class_id);
create index idx_registrations_status on public.registrations(status);
create index idx_registrations_created_at on public.registrations(created_at);
create index idx_registrations_selected_date on public.registrations(selected_date); 