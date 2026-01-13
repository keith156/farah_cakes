
import { createClient } from '@supabase/supabase-js';

// Vercel and Vite handle process.env differently. This helper ensures we get the keys.
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Cast import.meta to any to safely access Vite's env property without TypeScript errors
  const meta = import.meta as any;
  if (meta.env && meta.env[key]) {
    return meta.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Only initialize if credentials exist
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.error("Supabase configuration missing! Please add SUPABASE_URL and SUPABASE_ANON_KEY to your Environment Variables.");
}
