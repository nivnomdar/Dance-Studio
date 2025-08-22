-- Add is_active to categories to allow hiding from shop
alter table if exists public.categories
  add column if not exists is_active boolean default true;

update public.categories set is_active = coalesce(is_active, true) where is_active is null;


