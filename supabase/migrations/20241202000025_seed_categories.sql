-- Seed categories and subcategories
-- Top-level categories
with inserted as (
  insert into public.categories (name, description)
  values
    ('הלבשה תחתונה', null),
    ('גרביונים', null),
    ('בגד גוף', null),
    ('סט', null),
    ('תחתונים', null),
    ('גרביים', null),
    ('עקבים', null),
    ('אקססוריז', null)
  returning id, name
)
-- Subcategories for "עקבים"
insert into public.categories (name, parent_id)
select sub.name, parent.id
from (
  select 'עקבים' as parent_name
) p
join public.categories parent on parent.name = p.parent_name
join (
  values
    ('עקבים לריקוד'),
    ('עקבים פלטפורמה לריקוד'),
    ('מגף ריקוד')
) as sub(name) on true;

-- Subcategories for "אקססוריז"
insert into public.categories (name, parent_id)
select sub.name, parent.id
from (
  select 'אקססוריז' as parent_name
) p
join public.categories parent on parent.name = p.parent_name
join (
  values
    ('תכשיטי גוף'),
    ('ברכיות')
) as sub(name) on true;


