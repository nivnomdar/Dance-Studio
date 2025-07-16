# Avigail Dance Studio

פרויקט סטודיו ריקוד אביגיל - מערכת מלאה עם frontend ו-backend לניהול שיעורי ריקוד והרשמות.

## 🎯 תכונות עיקריות

- ✅ **שיעורי ריקוד** - ניהול שיעורים עם תאריכים, שעות ומקומות זמינים
- ✅ **מערכת הרשמה מתקדמת** - הרשמה לשיעורים עם בדיקת זמינות בזמן אמת
- ✅ **ניהול פרופיל משתמש** - פרטים אישיים והיסטוריית הרשמות
- ✅ **מערכת קניות** - חנות עם מוצרים והזמנות
- ✅ **אימות משתמשים** - התחברות עם Google
- ✅ **ממשק משתמש מודרני** - עיצוב יפה ותמיכה מלאה בעברית ו-RTL
- ✅ **ניהול הרשמות** - סטטוסים שונים וניהול מתקדם
- ✅ **אבטחה מלאה** - RLS, אימות ובדיקות תקינות
- ✅ **ביצועים מיטביים** - caching, throttling ו-optimization

## 🏗️ מבנה הפרויקט

```
Avigail Dance Studio/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # רכיבי React
│   │   ├── pages/         # דפי האפליקציה
│   │   ├── contexts/      # React Contexts
│   │   ├── hooks/         # Custom Hooks
│   │   ├── lib/           # שירותי API
│   │   ├── types/         # TypeScript Types
│   │   └── utils/         # פונקציות עזר
│   └── public/            # קבצים סטטיים
├── backend/           # Express + TypeScript
│   ├── src/
│   │   ├── routes/        # נתיבי API
│   │   ├── middleware/    # Middleware
│   │   ├── types/         # TypeScript Types
│   │   └── utils/         # פונקציות עזר
│   └── logs/              # קבצי לוג
└── supabase/          # Database migrations
    └── migrations/        # קבצי מיגרציה
```

## 📋 דרישות מערכת

- **Node.js** (v18 או גבוה יותר)
- **npm** או **yarn**
- **חשבון Supabase**

## 🚀 התקנה והפעלה

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

## 🔌 API Endpoints

### Classes
- `GET /api/classes` - קבלת כל השיעורים הפעילים
- `GET /api/classes/:id` - קבלת שיעור לפי ID
- `GET /api/classes/slug/:slug` - קבלת שיעור לפי slug
- `POST /api/classes` - יצירת שיעור חדש (admin only)
- `PUT /api/classes/:id` - עדכון שיעור (admin only)
- `DELETE /api/classes/:id` - מחיקת שיעור (admin only)

### Sessions
- `GET /api/sessions` - קבלת כל ה-sessions
- `GET /api/sessions/session-classes` - קבלת session classes
- `GET /api/sessions/capacity/:classId/:date/:time` - בדיקת זמינות
- `GET /api/sessions/batch-capacity/:classId/:date` - בדיקת זמינות batch

### Registrations
- `GET /api/registrations` - קבלת כל ההרשמות (admin only)
- `GET /api/registrations/my` - קבלת ההרשמות של המשתמש המחובר
- `GET /api/registrations/:id` - קבלת הרשמה לפי ID
- `POST /api/registrations` - יצירת הרשמה חדשה
- `PUT /api/registrations/:id/status` - עדכון סטטוס הרשמה (admin only)
- `DELETE /api/registrations/:id` - מחיקת הרשמה

### 📊 **מבנה בסיס הנתונים**

#### **טבלת `classes`** - שיעורי ריקוד
```sql
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  long_description text,
  price integer not null,
  duration integer,
  level text,
  age_group text,
  max_participants integer,
  location text,
  included text,
  image_url text,
  video_url text,
  category text,
  color_scheme text,
  is_active boolean default true,
  start_time time,
  end_time time,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### **טבלת `schedule_sessions`** - מפגשים מתוזמנים
```sql
create table public.schedule_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_time time not null,
  end_time time not null,
  duration_minutes integer,
  start_date date,
  end_date date,
  weekdays integer[] not null,
  max_capacity integer not null,
  min_capacity integer default 1,
  location_id uuid,
  room_name text,
  address text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### **טבלת `session_classes`** - קישור בין מפגשים לשיעורים
```sql
create table public.session_classes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  session_id uuid references public.schedule_sessions(id) on delete cascade,
  price decimal(10,2),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### **טבלת `registrations`** - הרשמות לשיעורים
```sql
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  session_id uuid references public.schedule_sessions(id),
  session_class_id uuid references public.session_classes(id),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  selected_date date not null,
  selected_time text not null,
  experience text,
  notes text,
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 🛠️ פיתוח

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

## 🎨 תכונות עיצוב

- **עיצוב רספונסיבי** - עובד על כל המכשירים
- **תמיכה בעברית** - טקסטים וניווט מימין לשמאל
- **צבעים דינמיים** - כל שיעור עם צבע ייחודי
- **אנימציות חלקות** - חווית משתמש מעולה
- **Loading states** - אינדיקטורים ברורים לטעינה

## 🔒 אבטחה

- **Row Level Security (RLS)** - הגנה על נתונים ברמת השורה
- **אימות משתמשים** - Google OAuth
- **בדיקות תקינות** - וולידציה מלאה של נתונים
- **Rate Limiting** - הגנה מפני בקשות מוגזמות
- **CORS** - הגדרות אבטחה נכונות

## 📱 תמיכה במכשירים

- ✅ **Desktop** - Chrome, Firefox, Safari, Edge
- ✅ **Tablet** - iPad, Android tablets
- ✅ **Mobile** - iPhone, Android phones

## 🚀 Deploy

הפרויקט מוכן ל-deploy על:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Heroku, DigitalOcean
- **Database**: Supabase (מומלץ)

## 📞 תמיכה

לשאלות ותמיכה:
- **Email**: info@avigaildance.com
- **WhatsApp**: 050-1234567
- **Phone**: 050-1234567 