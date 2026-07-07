import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn('Supabase admin environment variables are not set.');
}

export const supabaseAdmin = createClient(url || 'https://placeholder.supabase.co', serviceKey || 'placeholder');
