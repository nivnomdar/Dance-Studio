-- Add trending and recommended flags to products
alter table if exists public.products
  add column if not exists trending boolean default false;

alter table if exists public.products
  add column if not exists recommended boolean default false;

-- Optional: backfill nulls to false if any
update public.products set trending = coalesce(trending, false) where trending is null;
update public.products set recommended = coalesce(recommended, false) where recommended is null;


