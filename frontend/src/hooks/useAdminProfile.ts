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
  let isAdmin = profile?.role === 'admin';
  
  // Temporary: Allow admin access for testing
  if (!isAdmin && profile?.email) {
    // Add your email here for testing
    const adminEmails = ['niv806@gmail.com', 'niv@example.com', 'admin@example.com']; // Added your email
    if (adminEmails.includes(profile.email)) {
      isAdmin = true;
    }
  }

  return { 
    profile, 
    isLoading, 
    error: null, // לא מחזירים שגיאה על הרשאות - הקומפוננט הראשי יטפל בזה
    isAdmin,
    refetch
  };
}

export default useAdminProfile; 