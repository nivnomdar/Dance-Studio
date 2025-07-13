import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminProfile } from '../../hooks/useAdminProfile';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoadingState from '../../components/admin/AdminLoadingState';
import AdminErrorState from '../../components/admin/AdminErrorState';
import { ADMIN_TABS } from '../../constants/adminTabs';

export default function AdminDashboard() {
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

  return (
    <AdminLayout tabs={ADMIN_TABS} profile={profile} />
  );
} 