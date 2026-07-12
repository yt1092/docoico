import { NextResponse } from 'next/server';
import { requireDemoOwner } from '@/lib/demoAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin.from('sessions').select('id,mode,expires_at,expected_count,candidate_options').eq('id', params.id).single();
  if (error || !data || (data.expires_at && new Date(data.expires_at) < new Date())) return NextResponse.json({ ok: false, error: 'Session not found or expired' }, { status: 404 });
  return NextResponse.json({ ok: true, session: data });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const access = await requireDemoOwner(request);
  if (!access.ok) return access.response;
  const { data: session } = await supabaseAdmin.from('sessions').select('host_id').eq('id', params.id).single();
  if (!session || session.host_id !== access.userId) return NextResponse.json({ ok: false, error: 'Session not found' }, { status: 404 });
  const { error } = await supabaseAdmin.from('sessions').delete().eq('id', params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
