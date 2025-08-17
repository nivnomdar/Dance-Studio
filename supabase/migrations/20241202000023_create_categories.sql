-- Create categories table (hierarchical)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.categories(id) on delete set null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies
-- Everyone can view categories
create policy "Categories are viewable by everyone."
  on categories for select
  using ( true );

-- Only admins can insert categories
create policy "Admins can insert categories."
  on categories for insert
  with check (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Only admins can update categories
create policy "Admins can update categories."
  on categories for update
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Only admins can delete categories
create policy "Admins can delete categories."
  on categories for delete
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Trigger for updated_at
create trigger handle_categories_updated_at
  before update on public.categories
  for each row
  execute procedure public.handle_updated_at();

-- Indexes
create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_categories_created_at on public.categories(created_at);


