import { useProfile } from './useProfile';

interface UseAdminProfileReturn {
  profile: ReturnType<typeof useProfile>['profile'];
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  refetch: () => void;
}

function useAdminProfile(): UseAdminProfileReturn {
  const { profile, isLoading, error, refetch } = useProfile();

  // אם יש שגיאה בטעינת הפרופיל, החזר אותה
  if (error) {
    return { profile, isLoading, error, isAdmin: false, refetch };
  }

  // בדוק אם המשתמש הוא מנהל
  const isAdmin = profile?.role === 'admin';

  return { 
    profile, 
    isLoading, 
    error: null, // לא מחזירים שגיאה על הרשאות - הקומפוננט הראשי יטפל בזה
    isAdmin,
    refetch
  };
}

export default useAdminProfile; 