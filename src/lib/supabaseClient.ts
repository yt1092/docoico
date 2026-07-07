import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('Supabase environment variables are not set.');
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder');
