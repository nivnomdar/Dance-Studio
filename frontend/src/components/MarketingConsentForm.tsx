import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MarketingConsentFormProps {
  userEmail: string;
  onSuccess: () => void;
}

export const MarketingConsentForm: React.FC<MarketingConsentFormProps> = ({ 
  onSuccess 
}) => {
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { loadProfile, profile, session } = useAuth() as any;

  // On mount: if user already has marketing_consent in DB, show permanent success
  useEffect(() => {
    const checkExistingConsent = async () => {
      try {
        if (!session?.access_token) return;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/consents`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) return;
        const consents = await response.json();
        const hasMarketing = Array.isArray(consents) && consents.some((c: any) => c.consent_type === 'marketing_consent' && c.version === null);
        if (hasMarketing) {
          setSuccess(true);
        }
      } catch (_) {
        // Silently ignore; fallback to normal flow
      }
    };
    checkExistingConsent();
  }, [session?.access_token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentChecked) {
      setError('אנא סמני את תיבת ההסכמה');
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

      // Update marketing consent like in UserProfile
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/accept-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          consent_type: 'marketing_consent',
          version: null,
          consented: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'שגיאה בעדכון הפרופיל');
      }

      // Immediately refetch the profile to update the state
      await loadProfile();
      
      setSuccess(true);
      // Trigger a re-render to show the regular newsletter form
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error updating marketing consent:', error);
      setError(error instanceof Error ? error.message : 'אירעה שגיאה בעדכון הפרופיל');
    } finally {
      setIsLoading(false);
    }
  };

  if (success || (profile && profile.marketing_consent)) {
    return (
      <div className="p-3 bg-green-900/20 border-2 border-green-500/30 rounded-md">
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full mr-2 bg-green-400"></div>
          <span className="text-sm font-medium text-green-300 mr-1">תודה! התווספת לרשימת התפוצה</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="marketing_consent"
          name="marketing_consent"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-[#EC4899] bg-white border-2 border-[#4B2E83]/30 rounded focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        <label
          htmlFor="marketing_consent"
          className="text-sm text-[#4B2E83] font-medium leading-relaxed cursor-pointer"
        >
          אני מסכימה לקבל עדכונים ומבצעים מהסטודיו
        </label>
      </div>
      <button
        type="submit"
        disabled={isLoading || !consentChecked}
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
        בסימון התיבה ולחיצה על הכפתור אני מאשרת קבלת תוכן שיווקי לכתובת המייל.
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
