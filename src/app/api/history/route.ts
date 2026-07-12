import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '') || null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabaseAdmin.from('user_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3);
    return NextResponse.json({ ok: true, history: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '') || null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { spot_id, note, spot_name, spot_category, lat, lng, transport } = body;
    // Reopening a candidate (for example via "提案に戻る") must refresh its
    // position in the history, not create another identical card.
    if (typeof spot_name === 'string' && spot_name.trim()) {
      const { error: duplicateError } = await supabaseAdmin
        .from('user_history')
        .delete()
        .eq('user_id', userId)
        .eq('spot_name', spot_name.trim());
      if (duplicateError) return NextResponse.json({ ok: false, error: duplicateError.message }, { status: 500 });
    }
    const { data, error } = await supabaseAdmin.from('user_history').insert([{
      user_id: userId, spot_id: spot_id || null, note: note || null,
      spot_name: typeof spot_name === 'string' ? spot_name.slice(0, 160) : null,
      spot_category: typeof spot_category === 'string' ? spot_category.slice(0, 80) : null,
      lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
      lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
      transport: typeof transport === 'string' ? transport.slice(0, 20) : null
    }]).select().single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    const { data: all } = await supabaseAdmin.from('user_history').select('id').eq('user_id', userId).order('created_at', { ascending: false });
    const olderIds = (all || []).slice(3).map(item => item.id);
    if (olderIds.length) await supabaseAdmin.from('user_history').delete().in('id', olderIds);
    return NextResponse.json({ ok: true, inserted: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
