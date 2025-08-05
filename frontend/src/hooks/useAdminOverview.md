# useAdminOverview Hook

Custom hook עבור הלוגיקה של AdminOverview.

## שימוש

```tsx
import { useAdminOverview } from '../hooks/useAdminOverview';

const MyComponent = () => {
  const {
    // Data
    data,
    filteredAndSortedSessions,
    summaryStats,
    
    // Loading states
    isLoading,
    isFetching,
    error,
    dataComplete,
    
    // State
    expandedSession,
    searchTerm,
    filterStatus,
    
    // Setters
    setSearchTerm,
    setFilterStatus,
    
    // Handlers
    handleViewClassDetails,
    handleEditRegistration,
    handleRefreshData,
    handleUpdateRegistration
  } = useAdminOverview();

  return (
    <div>
      {/* הרכיב שלך */}
    </div>
  );
};
```

## ערכים שמוחזרים

### Data
- `data` - נתוני התצוגה (עם fallback אם צריך)
- `processedSessions` - סשנים מעובדים
- `filteredAndSortedSessions` - סשנים מסוננים וממוינים
- `summaryStats` - סטטיסטיקות סיכום

### Loading States
- `isLoading` - האם טוען
- `isFetching` - האם מבצע fetch
- `error` - שגיאה אם יש
- `dataComplete` - האם הנתונים מלאים

### State
- `expandedSession` - ID של הסשן המורחב
- `expandedLinkedClasses` - ID של שיעורים מקושרים מורחבים
- `selectedClassForDetails` - שיעור נבחר לפרטים
- `selectedRegistrationForEdit` - הרשמה נבחרת לעריכה
- `searchTerm` - מונח חיפוש
- `filterStatus` - סטטוס פילטר

### Setters
- `setSearchTerm` - עדכון מונח חיפוש
- `setFilterStatus` - עדכון סטטוס פילטר
- `setSelectedClassForDetails` - בחירת שיעור לפרטים
- `setSelectedRegistrationForEdit` - בחירת הרשמה לעריכה

### Handlers
- `handleViewClassDetails` - הצגת פרטי שיעור
- `handleEditRegistration` - עריכת הרשמה
- `handleToggleSessionExpansion` - הרחבה/כיווץ סשן
- `handleToggleLinkedClassesExpansion` - הרחבה/כיווץ שיעורים מקושרים
- `handleRefreshData` - רענון נתונים
- `handleUpdateRegistration` - עדכון הרשמה
- `resetRateLimit` - איפוס הגבלת קצב

## יתרונות

1. **הפרדת לוגיקה** - הלוגיקה העסקית נפרדת מהרכיבים
2. **שימוש חוזר** - ניתן להשתמש ב-hook במקומות אחרים
3. **בדיקות** - קל לכתוב בדיקות ל-hook
4. **תחזוקה** - קל יותר לתקן ולשפר לוגיקה
5. **ביצועים** - useMemo ו-useCallback מונעים חישובים מיותרים 