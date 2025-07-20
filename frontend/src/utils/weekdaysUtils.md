# Weekdays Utilities

קובץ מרכזי לניהול כל הפונקציות והקבועים הקשורים ל-weekdays במערכת.

## קבועים

### `HEBREW_WEEKDAYS`
מערך של שמות הימים בעברית (0=ראשון, 1=שני, וכו')

### `ENGLISH_WEEKDAYS`
מערך של שמות הימים באנגלית (0=sunday, 1=monday, וכו')

### `DAY_NAMES_EN` / `DAY_NAMES_HE`
קבועים לשימוש ב-API responses

## פונקציות המרה

### `numberToHebrewDay(dayNumber: number): string`
ממירה מספר (0-6) לשם יום בעברית

### `numberToEnglishDay(dayNumber: number): string`
ממירה מספר (0-6) לשם יום באנגלית

### `englishToHebrewDay(englishDay: string): string`
ממירה שם יום באנגלית לעברית

### `hebrewToEnglishDay(hebrewDay: string): string`
ממירה שם יום בעברית לאנגלית

### `mixedToHebrewDay(mixedString: string): string`
מטפלת במחרוזות מעורבות כמו "שני Tuesday" ומחלצת את החלק העברי

### `anyToHebrewDay(weekday: string | number): string`
פונקציה כללית שמטפלת בכל פורמט ומחזירה עברית

## פונקציות מערך

### `weekdaysToHebrew(weekdays: (string | number)[]): string[]`
ממירה מערך של weekdays לכל פורמט למערך של שמות עבריים

### `formatWeekdaysToHebrew(weekdays: (string | number)[]): string`
ממירה מערך של weekdays למחרוזת מופרדת בפסיקים

## פונקציות תאריך

### `getHebrewDayFromDate(date: Date | string): string`
מחזירה את שם היום בעברית מתאריך

### `getEnglishDayFromDate(date: Date | string): string`
מחזירה את שם היום באנגלית מתאריך

## פונקציות בדיקה

### `isSessionActiveOnDay(session: any, dayName: string): boolean`
בודקת אם session פעיל ביום מסוים

## פונקציות עזר

### `getAllHebrewWeekdays(): string[]`
מחזירה מערך של כל שמות הימים בעברית

### `getAllEnglishWeekdays(): string[]`
מחזירה מערך של כל שמות הימים באנגלית

## שימוש

```typescript
import { 
  weekdaysToHebrew, 
  anyToHebrewDay, 
  isSessionActiveOnDay 
} from '../utils/weekdaysUtils';

// המרת מערך weekdays לעברית
const hebrewDays = weekdaysToHebrew([1, 2, 4]); // ['שני', 'שלישי', 'חמישי']

// המרת weekday בודד לעברית
const hebrewDay = anyToHebrewDay(1); // 'שני'

// בדיקה אם session פעיל ביום מסוים
const isActive = isSessionActiveOnDay(session, 'monday');
```

## יתרונות

1. **מרכזיות**: כל הלוגיקה של weekdays במקום אחד
2. **עקביות**: אותו פורמט בכל המערכת
3. **תחזוקה**: קל לתקן או לשנות לוגיקה
4. **Type Safety**: תמיכה מלאה ב-TypeScript
5. **גמישות**: תמיכה בפורמטים שונים (מספרים, מחרוזות, מעורב) 