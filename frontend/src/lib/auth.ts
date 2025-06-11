import { supabase } from './supabase';

export const handleAuthStateChange = async (event: string, session: any) => {
  if (event === 'SIGNED_IN' && session?.user) {
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

      const { error } = await supabase
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

      if (error) {
        console.error('Error creating profile:', error);
      }
    } else {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating last login:', error);
      }
    }
  }
}; 