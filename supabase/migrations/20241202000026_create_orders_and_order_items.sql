-- Ensure UUID generation via pgcrypto (gen_random_uuid)
create extension if not exists pgcrypto;

-- ===========================================
-- Orders
-- ===========================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigserial unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','cancelled')),
  total_amount numeric(10,2) not null default 0
    check (total_amount >= 0),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','refunded')),
  payment_provider text,
  payment_reference text,
  currency text not null default 'ILS',
  shipping_method text,
  tracking_number text,
  exchange_rate numeric(12,6) null check (exchange_rate is null or exchange_rate > 0),
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_shipping_address_json check (
    shipping_address is null or jsonb_typeof(shipping_address) = 'object'
  )
);

-- Indexes for orders
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_user_created_at on public.orders(user_id, created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- Unique payment reference per provider (partial)
create unique index if not exists uq_orders_payment_ref
  on public.orders (payment_provider, payment_reference)
  where payment_provider is not null and payment_reference is not null;

-- updated_at trigger (reuses public.handle_updated_at defined earlier)
drop trigger if exists handle_orders_updated_at on public.orders;
create trigger handle_orders_updated_at
  before update on public.orders
  for each row
  execute procedure public.handle_updated_at();

-- ===========================================
-- Order Items
-- ===========================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_price numeric(10,2) generated always as (quantity * unit_price) stored
);

-- Prevent duplicate product rows per order (optional; remove if duplicates allowed)
-- Use a unique index (supported with IF NOT EXISTS) instead of ADD CONSTRAINT
create unique index if not exists uq_item_per_product_per_order
  on public.order_items(order_id, product_id);

-- Indexes for order_items
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- ===========================================
-- Total auto-recalculation
-- ===========================================
create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
as $$
declare
  v_order_id uuid;
begin
  if (tg_op = 'DELETE') then
    v_order_id := old.order_id;
  else
    v_order_id := new.order_id;
  end if;

  update public.orders o
  set
    total_amount = coalesce((
      select sum(oi.total_price)::numeric(10,2)
      from public.order_items oi
      where oi.order_id = v_order_id
    ), 0),
    updated_at = now()
  where o.id = v_order_id;

  return null;
end;
$$;

drop trigger if exists trg_order_items_recalc on public.order_items;
create trigger trg_order_items_recalc
  after insert or update or delete on public.order_items
  for each row
  execute procedure public.recalculate_order_total();

-- ===========================================
-- RLS
-- ===========================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Users can select their own orders; admins can select all
drop policy if exists "Users can select own orders" on public.orders;
create policy "Users can select own orders"
  on public.orders for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Allow end-users to create their own orders directly (if frontend creates orders)
drop policy if exists "Users can create orders" on public.orders;
create policy "Users can create orders"
  on public.orders for insert
  with check (user_id = auth.uid());

-- Only admins can insert/update/delete orders
drop policy if exists "Admins can modify orders" on public.orders;
create policy "Admins can modify orders"
  on public.orders for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Users can select items of their own orders; admins can select all
drop policy if exists "Users can select own order items" on public.order_items;
create policy "Users can select own order items"
  on public.order_items for select
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.user_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        )
    )
  );

-- Only admins can insert/update/delete order_items
drop policy if exists "Admins can modify order items" on public.order_items;
create policy "Admins can modify order items"
  on public.order_items for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


