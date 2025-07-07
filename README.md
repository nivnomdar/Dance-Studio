# Avigail Dance Studio

פרויקט סטודיו ריקוד אביגיל - מערכת מלאה עם frontend ו-backend.

## מבנה הפרויקט

```
Avigail Dance Studio/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Express + TypeScript
└── supabase/          # Database migrations
```

## דרישות מערכת

- Node.js (v18 או גבוה יותר)
- npm או yarn
- חשבון Supabase

## התקנה והפעלה

### 1. הגדרת Supabase

1. צור פרויקט חדש ב-Supabase
2. הרץ את ה-migrations:
   ```bash
   npx supabase db reset
   ```

### 2. הגדרת Backend

1. עבור לתיקיית backend:
   ```bash
   cd backend
   ```

2. התקן תלויות:
   ```bash
   npm install
   ```

3. צור קובץ `.env` עם המשתנים הבאים:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   CORS_ORIGIN=http://localhost:5173
   ```

4. הפעל את השרת:
   ```bash
   npm run dev
   ```

### 3. הגדרת Frontend

1. עבור לתיקיית frontend:
   ```bash
   cd frontend
   ```

2. התקן תלויות:
   ```bash
   npm install
   ```

3. צור קובץ `.env` עם המשתנים הבאים:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. הפעל את האפליקציה:
   ```bash
   npm run dev
   ```

## API Endpoints

### Classes
- `GET /api/classes` - קבלת כל השיעורים הפעילים
- `GET /api/classes/:id` - קבלת שיעור לפי ID
- `GET /api/classes/slug/:slug` - קבלת שיעור לפי slug
- `POST /api/classes` - יצירת שיעור חדש (admin only)
- `PUT /api/classes/:id` - עדכון שיעור (admin only)
- `DELETE /api/classes/:id` - מחיקת שיעור (admin only)

### Registrations
- `GET /api/registrations` - קבלת כל ההרשמות (admin only)
- `GET /api/registrations/my` - קבלת ההרשמות של המשתמש המחובר
- `GET /api/registrations/:id` - קבלת הרשמה לפי ID
- `POST /api/registrations` - יצירת הרשמה חדשה
- `PUT /api/registrations/:id/status` - עדכון סטטוס הרשמה (admin only)
- `DELETE /api/registrations/:id` - מחיקת הרשמה

## מבנה נתונים

### טבלת Classes
```sql
create table public.classes (
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
  included text,
  image_url text,
  video_url text,
  category text,
  is_active boolean default true,
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### טבלת Registrations
```sql
create table public.registrations (
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
```

## פיתוח

### Backend
```bash
cd backend
npm run dev    # הפעלת שרת פיתוח
npm run build  # בניית הפרויקט
npm run lint   # בדיקת קוד
```

### Frontend
```bash
cd frontend
npm run dev     # הפעלת שרת פיתוח
npm run build   # בניית הפרויקט
npm run lint    # בדיקת קוד
```

## תכונות עיקריות

- ✅ שיעורי ריקוד עם נתונים מה-DB
- ✅ מערכת הרשמה לשיעורים עם פרטים מלאים
- ✅ ניהול פרופיל משתמש
- ✅ מערכת קניות
- ✅ אימות משתמשים עם Google
- ✅ ממשק משתמש מודרני ויפה
- ✅ תמיכה בעברית ו-RTL
- ✅ ניהול הרשמות עם סטטוסים
- ✅ אבטחה מלאה עם RLS 