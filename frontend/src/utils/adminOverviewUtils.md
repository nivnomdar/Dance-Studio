# Admin Overview Utils

פונקציות עזר עבור רכיבי AdminOverview.

## פונקציות זמינות

### `getDayOfWeekName(dayNumber: number): string`
מחזיר את שם היום בעברית לפי מספר היום.

### `getOccupancyColor(rate: number): string`
מחזיר את צבע התפוסה לפי אחוז התפוסה.

### `convertWeekdayToNumber(day: any): number | undefined`
ממיר יום בשבוע למספר.

### `generateUpcomingDates(weekdays: number[]): string[]`
מייצר תאריכים קרובים עבור ימי השבוע הנתונים.

### `processSessions(sessions, sessionClasses, registrations, classes): SessionData[]`
מעבד את הנתונים של הסשנים עם מידע נוסף.

### `filterAndSortSessions(sessions, searchTerm, filterStatus): SessionData[]`
מסנן וממיין את הסשנים לפי חיפוש וסטטוס.

### `calculateSummaryStats(sessions: SessionData[]): SummaryStats`
מחשב סטטיסטיקות סיכום עבור הסשנים.

### `groupRegistrationsByTime(registrations: any[]): RegistrationByTime`
מקבץ הרשמות לפי זמן.

### `hasCompleteData(data: any): boolean`
בודק אם הנתונים מלאים.

### `createFallbackData(data: any)`
יוצר נתוני גיבוי אם אין נתונים מלאים.

## שימוש

```tsx
import { 
  processSessions, 
  filterAndSortSessions,
  calculateSummaryStats 
} from '../utils/adminOverviewUtils';

// עיבוד נתונים
const processedSessions = processSessions(sessions, sessionClasses, registrations, classes);

// סינון ומיון
const filteredSessions = filterAndSortSessions(processedSessions, searchTerm, filterStatus);

// חישוב סטטיסטיקות
const stats = calculateSummaryStats(processedSessions);
```

## יתרונות

1. **הפרדת לוגיקה** - הלוגיקה העסקית נפרדת מהרכיבים
2. **בדיקות** - קל לכתוב בדיקות לפונקציות טהורות
3. **שימוש חוזר** - פונקציות ניתנות לשימוש במקומות אחרים
4. **תחזוקה** - קל יותר לתקן ולשפר פונקציות בודדות 