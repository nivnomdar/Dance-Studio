import { createClient } from '@supabase/supabase-js';

// הסתרת לוגים של GoTrueClient
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleInfo = console.info;

// פונקציה לבדיקה אם הלוג מגיע מ-GoTrueClient
const isGoTrueClientLog = (message: string) => {
  return message.includes('GoTrueClient') || 
         message.includes('supabase-js') ||
         message.includes('_acquireLock') ||
         message.includes('_useSession') ||
         message.includes('_loadSession') ||
         message.includes('getSession') ||
         message.includes('_saveSession') ||
         message.includes('_notifyAllSubscribers');
};

// משתנה לשליטה בהסתרת לוגים
let hideGoTrueClientLogs = true; // ברירת מחדל: להסתיר

// פונקציה להפעלה/כיבוי הסתרת לוגים
export const toggleGoTrueClientLogs = (hide: boolean = true) => {
  hideGoTrueClientLogs = hide;
};

// Override console methods to filter GoTrueClient logs
console.log = (...args) => {
  const message = args.join(' ');
  if (!hideGoTrueClientLogs || !isGoTrueClientLog(message)) {
    // originalConsoleLog.apply(console, args);
  }
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (!hideGoTrueClientLogs || !isGoTrueClientLog(message)) {
    // originalConsoleWarn.apply(console, args);
  }
};

console.error = (...args) => {
  const message = args.join(' ');
  if (!hideGoTrueClientLogs || !isGoTrueClientLog(message)) {
    // originalConsoleError.apply(console, args);
  }
};

console.info = (...args) => {
  const message = args.join(' ');
  if (!hideGoTrueClientLogs || !isGoTrueClientLog(message)) {
    // originalConsoleInfo.apply(console, args);
  }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// בדיקת תקינות המשתנים
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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
    flowType: 'pkce', // סוג הזרימה - PKCE (Proof Key for Code Exchange)
    debug: false // כיבוי לוגים לדיבוג כדי להאיץ
  }
});

// הוספת הפונקציה ל-global object כדי שניתן יהיה לקרוא לה מהקונסול
if (typeof window !== 'undefined') {
  (window as any).toggleGoTrueClientLogs = toggleGoTrueClientLogs;
} 