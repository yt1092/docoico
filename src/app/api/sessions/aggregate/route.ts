import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;
    if (!sessionId) return NextResponse.json({ ok: false, error: 'sessionId required' }, { status: 400 });

    // Aggregate votes
    const { data: votes } = await supabaseAdmin.from('votes').select('*').eq('session_id', sessionId);
    const counts: Record<string, number> = {};
    const moods: Record<string, number> = {};
    const atmos: Record<string, number> = {};
    const budgets: Record<string, number> = {};

    (votes || []).forEach((v: any) => {
      counts[v.genre] = (counts[v.genre] || 0) + 1;
      moods[v.mood] = (moods[v.mood] || 0) + 1;
      atmos[v.atmosphere] = (atmos[v.atmosphere] || 0) + 1;
      budgets[v.budget] = (budgets[v.budget] || 0) + 1;
    });

    // fetch session metadata
    const { data: session } = await supabaseAdmin.from('sessions').select('*').eq('id', sessionId).limit(1).single();

    const aggregated = {
      sessionId,
      total: votes?.length || 0,
      counts,
      moods,
      atmos,
      budgets,
      session
    };

    // Optionally, trigger /api/recommend by sending aggregated data
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aggregated })
      });
    } catch (e) {
      // ignore recommend trigger errors here
    }

    return NextResponse.json({ ok: true, aggregated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
