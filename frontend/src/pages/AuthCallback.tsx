import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // אם ההתחברות הצליחה, נווט לדף הבית
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error handling auth callback:', error);
        // במקרה של שגיאה, נווט לדף הבית בכל מקרה
        navigate('/', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9F6]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">מתחבר...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B2E83] mx-auto"></div>
      </div>
    </div>
  );
} 