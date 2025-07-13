# תהליך הרשמה לשיעורים - Registration Flow

## 🔄 **איך זה עובד כרגע:**

### 1. **Frontend (ClassDetailPage.tsx)**
```typescript
// משתמש ממלא טופס הרשמה
const registrationData = {
  class_id: classData.id,
  first_name: formData.first_name,
  last_name: formData.last_name,
  phone: formData.phone,
  email: user?.email || '',
  selected_date: selectedDate,
  selected_time: selectedTime
};

// שליחה לשרת
const result = await registrationsService.createRegistration(registrationData);
```

### 2. **API Service (api.ts)**
```typescript
// מוסיף Authorization header עם access token
const headers = await getAuthHeaders(); // Bearer token
const response = await fetch(`${API_BASE_URL}/registrations`, {
  method: 'POST',
  headers,
  body: JSON.stringify(data)
});
```

### 3. **Backend (registrations.ts)**
```typescript
// מקבל את הבקשה עם token
router.post('/', auth, validateRegistration, async (req, res) => {
  // בודק הרשאות
  // בודק אם השיעור קיים
  // בודק אם המשתמש כבר נרשם
  // שומר ב-Supabase
  // מחזיר תשובה
});
```

### 4. **Supabase Database**
```sql
-- שומר בטבלת registrations
INSERT INTO registrations (
  class_id, user_id, first_name, last_name, 
  phone, email, selected_date, selected_time, status
) VALUES (...);
```

## ✅ **מה תוקן:**

### 1. **Authentication**
- **לפני**: Backend לא קיבל token
- **אחרי**: Backend מקבל Bearer token מה-headers

### 2. **API Headers**
- **לפני**: `credentials: 'include'` (לא עבד)
- **אחרי**: `Authorization: Bearer <token>`

### 3. **Environment Variables**
- הוספת `VITE_API_BASE_URL` לקובץ env.example

## 🚀 **איך להפעיל:**

### 1. **Backend**
```bash
cd backend
npm install
npm run dev
```

### 2. **Frontend**
```bash
cd frontend
npm install
# צור קובץ .env עם ה-variables הנכונים
npm run dev
```

### 3. **Environment Variables**
צור קובץ `.env` ב-frontend:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🔍 **בדיקות:**

### 1. **בדיקת הרשמה**
1. היכנסי לשיעור כלשהו
2. התחברי עם Google
3. מלאי את פרטי ההרשמה
4. לחצי "הזמיני שיעור"
5. בדקי שההרשמה נשמרה ב-Supabase

### 2. **בדיקת Console**
- אין שגיאות CORS
- אין שגיאות 401/403
- התשובה היא 201 עם פרטי ההרשמה

### 3. **בדיקת Database**
```sql
SELECT * FROM registrations ORDER BY created_at DESC LIMIT 5;
```

## 🛠️ **שיפורים עתידיים:**

### 1. **Email Notifications**
- שליחת אימייל אישור למשתמש
- שליחת אימייל התראה למנהל

### 2. **Payment Integration**
- חיבור למערכת תשלומים
- עדכון סטטוס תשלום

### 3. **Calendar Integration**
- הוספה לאוטומטית ל-Google Calendar
- תזכורות לפני השיעור

### 4. **Admin Dashboard**
- ניהול הרשמות
- שינוי סטטוס
- ביטול הרשמות

## 📝 **הערות חשובות:**

1. **Security**: כל בקשה דורשת authentication
2. **Validation**: בדיקות בצד השרת לכל השדות
3. **Error Handling**: טיפול בשגיאות בצורה מקצועית
4. **Logging**: רישום כל ההרשמות ללוגים
5. **Rate Limiting**: הגבלת מספר בקשות למניעת spam 