import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MarketingConsentFormProps {
  userEmail: string;
  onSuccess: () => void;
}

export const MarketingConsentForm: React.FC<MarketingConsentFormProps> = ({ 
  userEmail, 
  onSuccess 
}) => {
  const [email, setEmail] = useState(''); // Always start with an empty email input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { loadProfile, profile } = useAuth(); // Also get profile from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('אנא הזיני כתובת אימייל תקינה');
      return;
    }

    // Add validation: If user is logged in, email must match their current email
    if (profile && profile.email && email.trim() !== profile.email) {
      setError('המייל שהוזן אינו תואם למייל של המשתמש המחובר.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('לא מחובר למערכת');
      }

      // Call backend API - only update marketing consent, not email itself
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/update-marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          // Do NOT send email to update here, as userEmail is for validation only
          marketing_consent: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה בעדכון הפרופיל');
      }

      const result = await response.json();
      
      if (result.success) {
        // Immediately refetch the profile to update the state
        await loadProfile();
        
        setSuccess(true);
        // Trigger a re-render to show the regular newsletter form
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error('שגיאה בעדכון הפרופיל');
      }

    } catch (error) {
      console.error('Error updating marketing consent:', error);
      setError(error instanceof Error ? error.message : 'אירעה שגיאה בעדכון הפרופיל');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-3 bg-green-900/20 border-2 border-green-500/30 rounded-md">
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full mr-2 bg-green-400"></div>
          <span className="text-sm font-medium text-green-300">
            תודה! הוספת אותך לרשימת התפוצה
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="האימייל שלך"
        required
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            מעדכן...
          </>
        ) : (
          'הישארי מעודכנת'
        )}
      </button>
      
      <p className="text-gray-400 text-xs text-center mt-3">
        בלחיצה על כפתור זה אני מאשרת קבלת תוכן שיווקי לכתובת המייל.
      </p>
      
      {error && (
        <div className="p-3 rounded-md border-2 bg-red-900/20 border-red-500/30 text-red-300">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-red-400"></div>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
    </form>
  );
};
