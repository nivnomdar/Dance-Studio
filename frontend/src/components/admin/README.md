# Admin Components

קומפוננטים לניהול דף הניהול של סטודיו אביגיל.

## מבנה התיקיות

```
admin/
├── AdminLayout.tsx      # מבנה כללי עם טאבים
├── README.md           # תיעוד זה
└── tabs/
    ├── AdminOverview.tsx   # טאב סקירה כללית
    ├── AdminClasses.tsx    # טאב ניהול שיעורים
    ├── AdminShop.tsx       # טאב ניהול חנות
    └── AdminContact.tsx    # טאב ניהול פניות
```

## קומפוננטים

### AdminLayout
הקומפוננט הראשי שמטפל במבנה הכללי של דף הניהול:
- כותרת הדף
- ניווט בין טאבים
- הצגת התוכן של הטאב הפעיל

### טאבים

#### AdminOverview
טאב הסקירה הכללית:
- הודעת ברכה למנהל
- סטטיסטיקות כלליות
- כפתורי פעולה מהירה

#### AdminClasses
טאב ניהול שיעורים:
- רשימת שיעורים פעילים
- ניהול הרשמות
- כלי ניהול שיעורים

#### AdminShop
טאב ניהול חנות:
- רשימת מוצרים
- ניהול הזמנות
- ניהול מלאי

#### AdminContact
טאב ניהול פניות:
- רשימת פניות צור קשר
- סטטיסטיקות פניות
- כלי ניהול פניות

## שימוש

```tsx
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './components/admin/tabs/AdminOverview';

// הגדרת טאבים
const TABS = [
  { key: 'overview', label: 'סקירה', component: AdminOverview },
  // ...
];

// שימוש
<AdminLayout tabs={TABS} profile={userProfile} />
```

## עיצוב

כל הקומפוננטים משתמשים בעיצוב תואם לשאר האתר:
- צבעים: `#EC4899` (ורוד), `#4B2E83` (סגול)
- גרדיאנטים ורקעים תואמים
- עיגולים וצללים עקביים 