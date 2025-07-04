-- Create profiles table
create table if not exists public.profiles (
  id uuid not null,
  email text not null,
  first_name text null,
  last_name text null,
  role text not null default 'user'::text,
  phone_number text null,
  city text null,
  address text null,
  postal_code text null,
  created_at timestamp with time zone null default now(),
  is_active boolean null default true,
  terms_accepted boolean null default false,
  marketing_consent boolean null default false,
  avatar_url text null,
  last_login_at timestamp without time zone null,
  language text null default 'he'::text,
  referral_code text null,
  notes text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at(); 