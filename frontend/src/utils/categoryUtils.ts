/**
 * פונקציות לתרגום קטגוריות שיעורים מאנגלית לעברית
 */

/**
 * תרגום קטגוריית שיעור מאנגלית לעברית
 */
export const translateCategory = (category: string): string => {
  switch (category?.toLowerCase()) {
    case 'trial':
      return 'שיעור ניסיון';
    case 'single':
      return 'שיעור בודד';
    case 'private':
      return 'שיעור אישי';
    case 'subscription':
      return 'מנוי חודשי';
    case 'ballet':
      return 'בלט';
    case 'jazz':
      return 'ג\'אז';
    case 'contemporary':
      return 'עכשווי';
    case 'hip-hop':
      return 'היפ הופ';
    case 'latin':
      return 'לטיני';
    case 'salsa':
      return 'סלסה';
    case 'bachata':
      return 'בצ\'אטה';
    case 'kizomba':
      return 'קיזומבה';
    case 'zumba':
      return 'זומבה';
    case 'pilates':
      return 'פילאטיס';
    case 'yoga':
      return 'יוגה';
    default:
      return category || ''; // אם אין תרגום, החזר את המקורי
  }
};

/**
 * תרגום קטגוריית מוצר מאנגלית לעברית
 */
export const translateProductCategory = (category: string): string => {
  switch (category?.toLowerCase()) {
    case 'shoes':
      return 'נעליים';
    case 'clothing':
      return 'בגדים';
    case 'accessories':
      return 'אביזרים';
    case 'equipment':
      return 'ציוד';
    case 'cosmetics':
      return 'קוסמטיקה';
    default:
      return category || '';
  }
};

/**
 * בדיקה אם קטגוריה היא שיעור פרטי
 */
export const isPrivateLesson = (category: string): boolean => {
  return category?.toLowerCase() === 'private';
};

/**
 * בדיקה אם קטגוריה היא שיעור ניסיון
 */
export const isTrialClass = (category: string): boolean => {
  return category?.toLowerCase() === 'trial';
};

/**
 * בדיקה אם קטגוריה היא מנוי
 */
export const isSubscription = (category: string): boolean => {
  return category?.toLowerCase() === 'subscription';
}; 