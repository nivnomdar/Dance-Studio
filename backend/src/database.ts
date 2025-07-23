import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Check if Supabase configuration is available
if (!config.supabase.url || !config.supabase.serviceKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  console.error('SUPABASE_URL:', config.supabase.url ? 'SET' : 'NOT SET');
  console.error('SUPABASE_SERVICE_KEY:', config.supabase.serviceKey ? 'SET' : 'NOT SET');
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey
); 