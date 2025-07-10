import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType, UserProfile } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null); // שימוש בטיפוס הקיים
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // קבלת session נוכחי
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // טעינת הפרופיל אם יש משתמש
      if (session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error && profileData) {
            setProfile(profileData);
          } else if (error) {
            console.error('Error loading profile on session init:', error);
          }
        } catch (error) {
          console.error('Error loading profile on session init:', error);
        }
      }
      
      setLoading(false);
    };

    getSession();

    // האזנה לשינויים ב-auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // יצירת פרופיל ברקע אם המשתמש התחבר
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // בדיקה פשוטה של החיבור ל-Supabase
              try {
                const { data: testData, error: testError } = await supabase
                  .from('profiles')
                  .select('count')
                  .limit(1);
                
                if (testError) {
                  console.error('Connection test failed:', testError);
                  return;
                }
              } catch (error) {
                console.error('Connection test threw exception:', error);
                return;
              }
              
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!existingProfile) {
                const fullName = session.user.user_metadata?.full_name || '';
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert([
                    {
                      id: session.user.id,
                      email: session.user.email,
                      first_name: firstName,
                      last_name: lastName,
                      role: 'user',
                      avatar_url: session.user.user_metadata?.avatar_url || null,
                      created_at: new Date().toISOString(),
                      is_active: true,
                      terms_accepted: false,
                      marketing_consent: false,
                      last_login_at: new Date().toISOString(),
                      language: 'he',
                      // הוספת השדה החדש
                      has_used_trial_class: false
                    }
                  ])
                  .select()
                  .single();

                if (createError) {
                  console.error('Error creating profile:', createError);
                } else {
                  // שמירת הפרופיל ב-state
                  setProfile(newProfile);
                }
              } else {
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ last_login_at: new Date().toISOString() })
                  .eq('id', session.user.id);

                if (updateError) {
                  console.error('Error updating last login:', updateError);
                } else {
                  // שמירת הפרופיל הקיים ב-state
                  setProfile(existingProfile);
                }
              }
            } catch (error) {
              console.error('Error handling profile in background:', error);
            }
          }, 2000);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // פונקציה לטעינת הפרופיל
  const loadProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    profile,
    profileLoading,
    loadProfile,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 