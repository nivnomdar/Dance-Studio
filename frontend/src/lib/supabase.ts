import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase environment variables are not set.');
  // If in a browser environment and not in production, show an alert
  if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
    alert('Supabase environment variables are not set. Please check your .env file.');
  }
  // In a server-side environment or production, you might want to throw an error or handle it differently
  throw new Error('Supabase environment variables are not set.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      // Use the API key as the authorization header for admin-level access
      // The user wants to use admin authorization rather than the service key.
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  }
});

// Custom logger for Supabase client
// This is a placeholder and should be replaced with a proper logging solution
// to avoid silencing console.log across the application.
// Temporarily disable this override to enable debugging.
/*
console.log = (...args) => {
  // console.debug("Supabase Log:", ...args);
  // Implement custom logging logic here if needed
  // For now, we are letting console.log pass through for debugging purposes.
};
*/

// Optional: Expose supabase client to window for easier debugging
// if (typeof window !== 'undefined') {
//   (window as any).supabase = supabase;
// } 