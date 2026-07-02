import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !serviceKey) {
  console.warn('Supabase admin environment variables are not set.');
}

export const supabaseAdmin = createClient(url ?? '', serviceKey ?? '');
