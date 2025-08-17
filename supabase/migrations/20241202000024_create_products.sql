-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  stock_quantity int default 0,
  is_active boolean default true,
  main_image text,
  gallery_images jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- Policies
-- Everyone can view active products
create policy "Products are viewable by everyone."
  on products for select
  using ( is_active = true );

-- Admins can view all products
create policy "Admins can select products."
  on products for select
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Only admins can insert products
create policy "Admins can insert products."
  on products for insert
  with check (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Only admins can update products
create policy "Admins can update products."
  on products for update
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Only admins can delete products
create policy "Admins can delete products."
  on products for delete
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Trigger for updated_at
create trigger handle_products_updated_at
  before update on public.products
  for each row
  execute procedure public.handle_updated_at();

-- Indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_created_at on public.products(created_at);
create index if not exists idx_products_is_active on public.products(is_active);


