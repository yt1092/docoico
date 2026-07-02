import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, host_id, expires_in_minutes } = body;
    const expires_at = expires_in_minutes ? new Date(Date.now() + expires_in_minutes * 60000).toISOString() : null;

    const { data, error } = await supabaseAdmin.from('sessions').insert([{ mode, host_id, expires_at, expected_count: body.expected_count ?? null }]).select().limit(1).single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, session: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
