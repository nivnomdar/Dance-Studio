# Date Utilities

קובץ מרכזי לניהול כל הפונקציות הקשורות לתאריכים וניווט שבועי במערכת.

## פונקציות פורמט

### `formatDate(dateString: string): string`
מעצבת תאריך לפורמט עברי
```typescript
formatDate('2024-07-20') // '20 ביולי'
```

### `formatDateRange(startDate: string, endDate: string): string`
מעצבת טווח תאריכים לפורמט עברי
```typescript
formatDateRange('2024-07-20', '2024-07-26') // '20 ביולי - 26 ביולי'
```

## פונקציות שבוע

### `getCurrentWeekInfo()`
מחזירה מידע על השבוע הנוכחי
```typescript
{
  start: '2024-07-20',
  end: '2024-07-26',
  startDate: Date,
  endDate: Date
}
```

### `getWeekInfo(weekNumber: number)`
מחזירה מידע על שבוע ספציפי
```typescript
getWeekInfo(1) // שבוע ראשון
getWeekInfo(2) // שבוע שני
```

### `isCurrentWeek(weekNumber: number): boolean`
בודקת אם זה השבוע הנוכחי
```typescript
isCurrentWeek(1) // true אם זה השבוע הראשון
```

### `getWeekRange(weekStartDate: string): string`
מחזירה טווח תאריכים של שבוע
```typescript
getWeekRange('2024-07-20') // '20 ביולי - 26 ביולי'
```

### `getWeekDates(weekStartDate: string): string[]`
מחזירה מערך של כל התאריכים בשבוע
```typescript
getWeekDates('2024-07-20') // ['2024-07-20', '2024-07-21', ...]
```

## פונקציות יום

### `getDayNameFromDate(dateString: string): string`
מחזירה שם יום באנגלית
```typescript
getDayNameFromDate('2024-07-20') // 'saturday'
```

### `getHebrewDayNameFromDate(dateString: string): string`
מחזירה שם יום בעברית
```typescript
getHebrewDayNameFromDate('2024-07-20') // 'שבת'
```

## פונקציות בדיקה

### `isToday(dateString: string): boolean`
בודקת אם התאריך הוא היום
```typescript
isToday('2024-07-20') // true אם היום 20 ביולי
```

### `isTomorrow(dateString: string): boolean`
בודקת אם התאריך הוא מחר
```typescript
isTomorrow('2024-07-21') // true אם מחר 21 ביולי
```

### `isInCurrentWeek(dateString: string): boolean`
בודקת אם התאריך בשבוע הנוכחי
```typescript
isInCurrentWeek('2024-07-20') // true אם 20 ביולי בשבוע הנוכחי
```

## פונקציות תיאור

### `getRelativeDateDescription(dateString: string): string`
מחזירה תיאור יחסי של התאריך
```typescript
getRelativeDateDescription('2024-07-20') // 'היום', 'מחר', 'בעוד 3 ימים'
```

### `getHebrewMonthName(dateString: string): string`
מחזירה שם חודש בעברית
```typescript
getHebrewMonthName('2024-07-20') // 'יולי'
```

### `getFullHebrewDate(dateString: string): string`
מחזירה תאריך מלא בעברית
```typescript
getFullHebrewDate('2024-07-20') // 'שבת, 20 ביולי 2024'
```

## שימוש

```typescript
import { 
  formatDate, 
  getWeekRange, 
  isCurrentWeek,
  getRelativeDateDescription,
  isToday,
  isTomorrow
} from '../utils/dateUtils';

// עיצוב תאריך
const formattedDate = formatDate('2024-07-20');

// טווח שבוע
const weekRange = getWeekRange('2024-07-20');

// בדיקה אם זה השבוע הנוכחי
const isCurrent = isCurrentWeek(1);

// בדיקה אם זה היום או מחר
const isTodayDate = isToday('2024-07-20');
const isTomorrowDate = isTomorrow('2024-07-21');

// תיאור יחסי
const description = getRelativeDateDescription('2024-07-20');
```

## יתרונות

1. **מרכזיות**: כל הלוגיקה של תאריכים במקום אחד
2. **עקביות**: אותו פורמט בכל המערכת
3. **תחזוקה**: קל לתקן או לשנות לוגיקה
4. **Type Safety**: תמיכה מלאה ב-TypeScript
5. **גמישות**: פונקציות מתמחות לכל צורך
6. **לוקליזציה**: תמיכה מלאה בעברית 