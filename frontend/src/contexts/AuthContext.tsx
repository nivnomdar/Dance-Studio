import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // קבלת session נוכחי
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
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
              console.log('Creating profile in background for user:', session.user.email);
              
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!existingProfile) {
                console.log('Creating new profile...');
                const fullName = session.user.user_metadata?.full_name || '';
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const { error: createError } = await supabase
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
                      language: 'he'
                    }
                  ]);

                if (createError) {
                  console.error('Error creating profile:', createError);
                } else {
                  console.log('Profile created successfully');
                }
              } else {
                console.log('Profile already exists, updating last login...');
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ last_login_at: new Date().toISOString() })
                  .eq('id', session.user.id);

                if (updateError) {
                  console.error('Error updating last login:', updateError);
                }
              }
            } catch (error) {
              console.error('Error handling profile in background:', error);
            }
          }, 1000);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
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