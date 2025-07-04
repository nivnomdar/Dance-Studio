import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // timeout כללי של 10 שניות
      const overallTimeout = setTimeout(() => {
        navigate('/', { replace: true });
      }, 10000);
      
      try {
        // נחכה לשינוי ב-auth state
        const sessionPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Auth state change timeout'));
          }, 5000);
          
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve(session);
          });
        });
        
        try {
          await sessionPromise as any;
        } catch (error) {
          // Error handling without logging
        }
        
        // נעבור לדף הבית מיד, הפרופיל ייווצר ברקע
        navigate('/', { replace: true });
      } catch (error) {
        // במקרה של שגיאה, נווט לדף הבית בכל מקרה
        navigate('/', { replace: true });
      } finally {
        clearTimeout(overallTimeout);
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