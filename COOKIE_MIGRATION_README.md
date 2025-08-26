# Cookie Migration Guide - מדריך הגירה ל-Cookies

## סקירה כללית

האתר עבר בהצלחה משימוש ב-localStorage ו-sessionStorage לשימוש ב-Cookies מאובטחים ומקצועיים, 
בהתאם לדרישות החוק הישראלי (חוק הגנת הפרטיות, תיקון 13) והתקנים הבינלאומיים (GDPR, OWASP).

## שינויים שבוצעו

### 1. Backend Changes

#### התקנת ספריות חדשות:
```bash
cd backend
npm install cookie-parser express-session js-cookie @types/js-cookie @types/cookie-parser @types/express-session
```

#### קבצים שנוצרו/עודכנו:
- `src/utils/cookieManager.ts` - מערכת ניהול Cookies מאובטחת
- `src/index.ts` - הוספת middleware לניהול Cookies ו-Sessions
- `src/routes/auth.ts` - עדכון לשימוש ב-Cookies

#### הגדרות אבטחה:
- **HttpOnly**: Cookies לאימות משתמשים (מניעת XSS)
- **Secure**: Cookies עוברים רק ב-HTTPS בייצור
- **SameSite=Strict**: מניעת CSRF attacks
- **maxAge**: תוקף מוגבל לכל Cookie

### 2. Frontend Changes

#### התקנת ספריות חדשות:
```bash
cd frontend
npm install js-cookie @types/js-cookie
```

#### קבצים שנוצרו/עודכנו:
- `src/utils/cookieManager.ts` - מערכת ניהול Cookies בצד הלקוח
- `src/contexts/AuthContext.tsx` - החלפת sessionStorage ב-Cookies
- `src/contexts/CartContext.tsx` - החלפת sessionStorage ב-Cookies
- `src/hooks/useProfile.ts` - החלפת sessionStorage ב-Cookies
- `src/utils/sessionsUtils.ts` - החלפת localStorage ב-Cookies
- `src/pages/ClassesPage.tsx` - החלפת sessionStorage ב-Cookies
- `src/pages/UserProfile.tsx` - החלפת sessionStorage ב-Cookies
- `src/components/layout/Navbar.tsx` - עדכון ניקוי Cookies
- `src/lib/supabase.ts` - ביטול שמירת session ב-localStorage
- `src/components/layout/CookieConsentBanner.tsx` - באנר הסכמה ל-Cookies
- `src/pages/PrivacyPolicy.tsx` - הוספת מידע על Cookies

### 3. Cookie Consent Banner

נוצר באנר הסכמה לשימוש ב-Cookies הכולל:
- הסבר ברור על השימוש ב-Cookies
- כפתורי הסכמה/אי-הסכמה
- קישור למדיניות פרטיות
- שמירת בחירת המשתמש

### 4. מדיניות פרטיות

עודכן עם סעיף מפורט על Cookies הכולל:
- סוגי Cookies בשימוש
- אמצעי אבטחה
- זכויות המשתמש
- איך לשלוט ב-Cookies

## סוגי Cookies בשימוש

### Cookies חיוניים (Essential):
- `ladances-session-id` - Session ID מאובטח (HttpOnly, Secure)
- `ladances-user-id` - User ID מאובטח (HttpOnly, Secure)
- `ladances-session` - Express session (HttpOnly, Secure)

### Cookies לשיפור ביצועים (Performance):
- `ladances-profile-cache` - Cache פרופיל משתמש (5 דקות)
- `ladances-cart-cache` - Cache סל קניות (24 שעות)
- `ladances-classes-cache` - Cache רשימת שיעורים (5 דקות)
- `ladances-sessions-cache` - Cache sessions (5 דקות)
- `ladances-profile-creating` - דגל יצירת פרופיל (5 דקות)
- `ladances-classes-count` - מונה שיעורים (5 דקות)

## אבטחה

### מניעת XSS:
- Cookies לאימות משתמשים מוגדרים כ-HttpOnly
- לא ניתן לגשת אליהם מ-JavaScript

### מניעת CSRF:
- SameSite=Strict מונע CSRF attacks
- Cookies מאובטחים עם Secure בייצור

### תוקף מוגבל:
- כל Cookie מוגדר עם maxAge מתאים
- Cookies נמחקים אוטומטית כשפג תוקפם

## בדיקות נדרשות

### 1. בדיקת פונקציונליות:
- [ ] התחברות והתנתקות עובדות
- [ ] שמירת פרופיל משתמש עובדת
- [ ] שמירת סל קניות עובדת
- [ ] Cache של שיעורים עובד
- [ ] Cache של sessions עובד

### 2. בדיקת אבטחה:
- [ ] Cookies לאימות מוגדרים כ-HttpOnly
- [ ] Cookies מוגדרים כ-Secure בייצור
- [ ] SameSite=Strict מוגדר נכון
- [ ] תוקף Cookies מוגבל כראוי

### 3. בדיקת תאימות:
- [ ] Cookie Consent Banner מוצג
- [ ] מדיניות פרטיות מעודכנת
- [ ] כל הפיצ'רים עובדים כמו קודם

## הוראות יישום

### 1. הגדרת משתני סביבה:
```bash
# backend/.env
SESSION_SECRET=your_secure_session_secret_here_change_in_production
```

### 2. הפעלת השרתים:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 3. בדיקת Cookies:
- פתח Developer Tools > Application > Cookies
- בדוק שה-Cookies מוגדרים עם האפשרויות הנכונות
- בדוק שה-Cookies נמחקים כשפג תוקפם

## פתרון בעיות

### בעיה: Cookies לא נשמרים
**פתרון**: בדוק שה-CORS מוגדר נכון עם `credentials: true`

### בעיה: Cookies לא נמחקים
**פתרון**: Cookies נמחקים אוטומטית כשפג תוקפם, אין צורך למחוק ידנית

### בעיה: שגיאות TypeScript
**פתרון**: וודא שכל ה-type definitions הותקנו נכון

## תמיכה

לשאלות או בעיות:
- בדוק את הלוגים ב-Developer Tools
- בדוק את הלוגים בשרת Backend
- פנה לצוות הפיתוח עם פרטי השגיאה

## סיכום

הגירה זו משפרת משמעותית את האבטחה והתאימות של האתר:
- ✅ תואם לדרישות החוק הישראלי
- ✅ תואם לתקנים בינלאומיים (GDPR, OWASP)
- ✅ מניעת XSS ו-CSRF attacks
- ✅ שמירה על כל הפונקציונליות הקיימת
- ✅ חוויית משתמש משופרת עם Cookie Consent
- ✅ ניהול אבטחה מתקדם
