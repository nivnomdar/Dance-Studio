import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// בדיקת תקינות המשתנים
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// בדיקת תקינות ה-URL
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL: ${supabaseUrl}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // שמירת session ב-localStorage
    storageKey: 'avigail-dance-studio-auth', // מפתח ייחודי לאפליקציה
    autoRefreshToken: true, // חידוש אוטומטי של token
    detectSessionInUrl: true, // זיהוי session מה-URL
    flowType: 'pkce' // סוג הזרימה - PKCE (Proof Key for Code Exchange)
  }
}) 