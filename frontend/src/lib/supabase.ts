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

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

// בדיקה מפורטת של ה-API key
if (supabaseAnonKey) {
  console.log('API Key length:', supabaseAnonKey.length);
  console.log('API Key starts with:', supabaseAnonKey.substring(0, 10) + '...');
  console.log('API Key ends with:', '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 10));
}

// בדיקה נוספת של ה-URL
console.log('URL protocol:', new URL(supabaseUrl).protocol);
console.log('URL hostname:', new URL(supabaseUrl).hostname);
console.log('URL port:', new URL(supabaseUrl).port);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'avigail-dance-studio-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// בדיקה של החיבור ל-Supabase
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // בדיקה עם fetch
    console.log('Testing with fetch...');
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Fetch response status:', response.status);
    console.log('Fetch response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Fetch data:', data);
    } else {
      const errorText = await response.text();
      console.log('Fetch error text:', errorText);
    }
    
    // בדיקה עם SDK
    console.log('Testing with SDK...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    console.log('SDK test result:', { data, error });
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};

// הרצת בדיקת החיבור
testConnection(); 