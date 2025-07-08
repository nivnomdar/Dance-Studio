-- Create classes table
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  long_description text,
  price numeric not null,
  duration int,
  level text,
  age_group text,
  max_participants int,
  location text,
  included text, -- מה כלול בשיעור
  image_url text,
  video_url text,
  category text,
  color_scheme text default 'pink', -- צבע ערכת נושא: pink, purple, emerald, blue
  is_active boolean default true,
  start_time timestamptz, -- אם תרצה תאריכים בעתיד
  end_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.classes enable row level security;

-- Create policies for classes

-- Everyone can view active classes (no authentication required)
create policy "Classes are viewable by everyone."
  on classes for select
  using ( is_active = true );

-- Only admins can insert new classes
create policy "Admins can insert classes."
  on classes for insert
  with check ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Only admins can update classes
create policy "Admins can update classes."
  on classes for update
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Only admins can delete classes
create policy "Admins can delete classes."
  on classes for delete
  using ( 
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Create trigger for updated_at
create trigger handle_classes_updated_at
  before update on public.classes
  for each row
  execute procedure public.handle_updated_at();

-- Create indexes for better performance
create index idx_classes_is_active on public.classes(is_active);
create index idx_classes_category on public.classes(category);
create index idx_classes_created_at on public.classes(created_at);
create index idx_classes_slug on public.classes(slug);

-- Insert sample data
insert into public.classes (name, slug, description, price, duration, level, category, image_url, color_scheme) values
('שיעור ניסיון', 'trial-class', 'שיעור ניסיון ראשון במחיר מיוחד. הזדמנות מצוינת להתנסות בריקוד על עקבים ולהכיר את הסטודיו.', 60, 60, 'מתחילות', 'trial', '/carousel/image1.png', 'pink'),
('שיעור בודד', 'single-class', 'שיעור בודד לקבוצת מתחילות. מתאים למי שרוצה להתנסות או להשתתף באופן חד פעמי.', 75, 60, 'מתחילות', 'single', '/carousel/image2.png', 'purple'),
('שיעור אישי', 'private-lesson', 'שיעור פרטי אחד על אחד עם אביגיל. מתאים למי שרוצה תשומת לב אישית והתקדמות מהירה.', 150, 60, 'כל הרמות', 'private', '/carousel/image4.png', 'emerald'),
('מנוי חודשי', 'monthly-subscription', 'מנוי חודשי הכולל 4 שעות שיעורים. שומר מקום קבוע בקבוצה ומחיר משתלם.', 350, 240, 'מתחילות', 'subscription', '/carousel/image3.png', 'blue'); 