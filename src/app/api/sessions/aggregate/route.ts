import { NextResponse } from 'next/server';
import { requireDemoOwner } from '@/lib/demoAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  const access = await requireDemoOwner(request);
  if (!access.ok) return access.response;
  const { sessionId } = await request.json();
  if (!sessionId) return NextResponse.json({ ok: false, error: 'sessionId required' }, { status: 400 });
  const { data: session } = await supabaseAdmin.from('sessions').select('host_id,candidate_options').eq('id', sessionId).single();
  if (!session || session.host_id !== access.userId) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  const { data: votes } = await supabaseAdmin.from('votes').select('candidate_name').eq('session_id', sessionId);
  const counts = (votes ?? []).reduce((all: Record<string, number>, vote: { candidate_name?: string }) => vote.candidate_name ? { ...all, [vote.candidate_name]: (all[vote.candidate_name] ?? 0) + 1 } : all, {});
  const winner = (Object.entries(counts) as Array<[string, number]>).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  return NextResponse.json({ ok: true, aggregated: { total: votes?.length ?? 0, counts, winner } });
}
