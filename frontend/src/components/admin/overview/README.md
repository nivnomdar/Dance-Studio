# Admin Overview Components

זהו ארגון מחדש של רכיבי AdminOverview כדי לשפר את הקריאות, התחזוקה והשימושיות של הקוד.

## מבנה הקבצים

### `AdminOverviewComponents.tsx`
רכיבים קטנים וניתנים לשימוש חוזר:
- `AdminOverviewLoadingState` - מצב טעינה
- `AdminOverviewErrorState` - מצב שגיאה
- `AdminOverviewNoDataState` - מצב ללא נתונים
- `AdminOverviewFilters` - רכיב הפילטרים
- `DateDisplay` - הצגת תאריך
- `TimeDisplay` - הצגת שעות
- `StatusBadge` - תג סטטוס
- `AdminOverviewNoResults` - מצב ללא תוצאות

### `AdminOverviewTable.tsx`
רכיב הטבלה הראשי עם כל הלוגיקה של הצגת הנתונים והאינטראקציה.

## שימוש

```tsx
import { 
  AdminOverviewLoadingState, 
  AdminOverviewErrorState,
  AdminOverviewTable 
} from '../components/admin/overview';

// שימוש ברכיבים
<AdminOverviewLoadingState />
<AdminOverviewTable sessions={sessions} ... />
```

## יתרונות הארגון החדש

1. **הפרדת אחריות** - כל רכיב אחראי על פונקציונליות ספציפית
2. **שימוש חוזר** - רכיבים קטנים ניתנים לשימוש במקומות אחרים
3. **תחזוקה קלה** - קל יותר למצוא ולתקן באגים
4. **בדיקות** - קל יותר לכתוב בדיקות לרכיבים קטנים
5. **ביצועים** - רכיבים קטנים מתעדכנים פחות

## קישורים לקבצים קשורים

- `../../../types/admin.ts` - טיפוסים
- `../../../utils/adminOverviewUtils.ts` - פונקציות עזר
- `../../../hooks/useAdminOverview.ts` - לוגיקה עסקית 