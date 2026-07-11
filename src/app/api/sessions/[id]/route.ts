import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin.from('sessions').select('id,mode,expires_at,expected_count,candidate_options').eq('id', params.id).single();
  if (error || !data || (data.expires_at && new Date(data.expires_at) < new Date())) return NextResponse.json({ ok: false, error: 'Session not found or expired' }, { status: 404 });
  return NextResponse.json({ ok: true, session: data });
}
