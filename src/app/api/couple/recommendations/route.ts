import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function currentUser(request: Request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data } = await supabaseAdmin.auth.getUser(token);
  return data.user ?? null;
}

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('couple_recommendations')
    .select('id, spot_name, spot_category, spot_reason, created_at, sender:profiles!couple_recommendations_sender_id_fkey(display_name, avatar_url)')
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, recommendations: data || [] });
}

export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabaseAdmin.from('profiles').select('partner_user_id').eq('id', user.id).maybeSingle();
  if (!profile?.partner_user_id) return NextResponse.json({ ok: false, error: 'マイページの設定で恋人のアカウントを登録してください。' }, { status: 400 });
  const body = await request.json();
  if (!body.name || typeof body.name !== 'string') return NextResponse.json({ ok: false, error: '候補名が必要です。' }, { status: 400 });
  const { error } = await supabaseAdmin.from('couple_recommendations').insert({
    sender_id: user.id,
    partner_id: profile.partner_user_id,
    spot_name: body.name.slice(0, 160),
    spot_category: typeof body.category === 'string' ? body.category.slice(0, 80) : null,
    spot_reason: typeof body.reason === 'string' ? body.reason.slice(0, 500) : null
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
