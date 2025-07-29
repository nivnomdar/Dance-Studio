import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useAdminProfile from '../../hooks/useAdminProfile';
import { AdminLayout, AdminLoadingState, AdminErrorState } from '../../components/admin';
import { AdminDataProvider } from '../../contexts/AdminDataContext';
import { ADMIN_TABS } from '../../constants/adminTabs';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading, error, isAdmin } = useAdminProfile();

  // Handle navigation in useEffect to avoid React errors
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/', { replace: true });
      } else if (!isLoading && !isAdmin) {
        navigate('/', { replace: true });
      }
    }
  }, [user, authLoading, isLoading, isAdmin, navigate]);

  // Auth loading state
  if (authLoading) {
    return <AdminLoadingState message="טוען..." />;
  }

  // No user state - show loading while redirecting
  if (!user && !authLoading) {
    return <AdminLoadingState message="מפנה לדף הבית..." />;
  }

  // Profile loading state
  if (isLoading) {
    return <AdminLoadingState message="טוען פרופיל..." />;
  }

  // Error state - רק שגיאות בטעינת פרופיל
  if (error) {
    return <AdminErrorState message={error} />;
  }

  // Check if user is admin - show loading while redirecting
  if (!isAdmin) {
    return <AdminLoadingState message="מפנה לדף הבית..." />;
  }

  // Check if profile exists
  if (!profile) {
    return <AdminErrorState message="פרופיל לא נמצא" />;
  }

  return (
    <AdminDataProvider>
      <AdminLayout tabs={ADMIN_TABS as any} profile={profile} />
    </AdminDataProvider>
  );
} 