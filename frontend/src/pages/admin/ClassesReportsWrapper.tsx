import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useAdminProfile from '../../hooks/useAdminProfile';
import { AdminLoadingState, AdminErrorState } from '../../components/admin';
import { AdminDataProvider } from '../../contexts/AdminDataContext';
import ClassesReports from './ClassesReports';

export default function ClassesReportsWrapper() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading, error, isAdmin } = useAdminProfile();

  // Auth loading state
  if (authLoading) {
    return <AdminLoadingState message="טוען..." />;
  }

  // No user state - redirect to home
  if (!user && !authLoading) {
    navigate('/', { replace: true });
    return null;
  }

  // Profile loading state
  if (isLoading) {
    return <AdminLoadingState message="טוען פרופיל..." />;
  }

  // Error state - רק שגיאות בטעינת פרופיל
  if (error) {
    return <AdminErrorState message={error} />;
  }

  // Check if user is admin - redirect to home if not
  if (!isAdmin) {
    navigate('/', { replace: true });
    return null;
  }

  // Check if profile exists
  if (!profile) {
    return <AdminErrorState message="פרופיל לא נמצא" />;
  }

  return (
    <AdminDataProvider>
      <ClassesReports profile={profile} />
    </AdminDataProvider>
  );
} 