# Supabase Database Setup

## מבנה הטבלאות והפוליסות

### טבלת `classes`

**מטרה**: אחסון מידע על שיעורי הריקוד

**פוליסות**:
- ✅ **כולם יכולים לראות** שיעורים פעילים (ללא התחברות)
- ✅ **רק admins יכולים** ליצור, לערוך ולמחוק שיעורים

**שדות עיקריים**:
- `id` - מזהה ייחודי
- `name` - שם השיעור
- `slug` - מזהה URL ייחודי
- `description` - תיאור קצר
- `long_description` - תיאור מפורט
- `price` - מחיר
- `duration` - משך השיעור בדקות
- `level` - רמת קושי
- `category` - קטגוריה (trial, single, private, subscription)
- `is_active` - האם השיעור פעיל
- `image_url` - תמונת השיעור

### טבלת `registrations`

**מטרה**: מעקב אחר הרשמות לשיעורים עם פרטים מלאים

**פוליסות**:
- ✅ **משתמשים מחוברים יכולים** לראות רק את ההרשמות שלהם
- ✅ **משתמשים מחוברים יכולים** להירשם לשיעורים חדשים
- ✅ **משתמשים מחוברים יכולים** לעדכן/למחוק את ההרשמות שלהם
- ✅ **Admins יכולים** לראות ולנהל את כל ההרשמות

**שדות עיקריים**:
- `id` - מזהה ייחודי
- `class_id` - מזהה השיעור (קישור ל-classes)
- `user_id` - מזהה המשתמש (קישור ל-profiles)
- `first_name` - שם פרטי
- `last_name` - שם משפחה
- `phone` - מספר טלפון
- `email` - כתובת אימייל
- `experience` - ניסיון בריקוד
- `selected_date` - תאריך נבחר
- `selected_time` - שעה נבחרת
- `notes` - הערות נוספות
- `status` - סטטוס ההרשמה (pending, confirmed, cancelled)
- `payment_id` - מזהה תשלום

## זרימת העבודה

### 1. צפייה בשיעורים
```
משתמש לא מחובר → יכול לראות את כל השיעורים הפעילים
משתמש מחובר → יכול לראות את כל השיעורים הפעילים
```

### 2. הרשמה לשיעור
```
משתמש לא מחובר → לא יכול להירשם (צריך להתחבר)
משתמש מחובר → יכול להירשם לשיעור חדש עם פרטים מלאים
```

### 3. ניהול הרשמות
```
משתמש מחובר → יכול לראות ולנהל רק את ההרשמות שלו
Admin → יכול לראות ולנהל את כל ההרשמות
```

## הרצת Migrations

```bash
# הרצת כל ה-migrations
npx supabase db reset

# או הרצה ספציפית
npx supabase migration up
```

## בדיקת הפוליסות

### בדיקת classes
```sql
-- בדיקה שכולם יכולים לראות שיעורים פעילים
select * from classes where is_active = true;

-- בדיקה שרק admins יכולים ליצור שיעורים
insert into classes (name, slug, description, price) 
values ('test', 'test', 'test', 100);
```

### בדיקת registrations
```sql
-- בדיקה שמשתמשים יכולים לראות רק את ההרשמות שלהם
select * from registrations where user_id = auth.uid();

-- בדיקה שמשתמשים יכולים להירשם לשיעורים
insert into registrations (
  class_id, user_id, first_name, last_name, phone, email, 
  selected_date, selected_time
) values (
  'class-id-here', auth.uid(), 'שם מלא', '0501234567', 
  'test@example.com', '2024-01-15', '18:00'
);
```

## אבטחה

- ✅ **Row Level Security (RLS)** מופעל על כל הטבלאות
- ✅ **פוליסות מפורטות** לכל פעולה
- ✅ **קישורים תקינים** בין הטבלאות
- ✅ **Indexes** לביצועים טובים
- ✅ **Triggers** לעדכון אוטומטי של timestamps
- ✅ **Validation** לנתונים נכנסים 