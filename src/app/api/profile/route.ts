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

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name, avatar_url, birth_date, partner_user_id, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const { data: partner } = profile?.partner_user_id
    ? await supabaseAdmin.from('profiles').select('id, display_name, avatar_url').eq('id', profile.partner_user_id).maybeSingle()
    : { data: null };
  return NextResponse.json({ ok: true, profile, partner, email: user.email });
}

export async function PATCH(request: Request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const display_name = typeof body.display_name === 'string' ? body.display_name.trim().slice(0, 40) : undefined;
  const avatar_url = typeof body.avatar_url === 'string' ? body.avatar_url.trim().slice(0, 1000) || null : undefined;
  const birth_date = typeof body.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.birth_date) ? body.birth_date : null;
  let partner_user_id: string | null | undefined;

  if (typeof body.partner_email === 'string') {
    const partnerEmail = body.partner_email.trim().toLowerCase();
    if (!partnerEmail) {
      partner_user_id = null;
    } else if (partnerEmail === user.email?.toLowerCase()) {
      return NextResponse.json({ ok: false, error: '自分自身を恋人として登録することはできません。' }, { status: 400 });
    } else {
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      const partner = users.users.find(candidate => candidate.email?.toLowerCase() === partnerEmail);
      if (!partner) return NextResponse.json({ ok: false, error: 'そのメールアドレスのユーザーが見つかりません。相手にも先にDOCOICOへログインしてもらってください。' }, { status: 404 });
      partner_user_id = partner.id;
    }
  }

  const values = {
    id: user.id,
    provider: user.app_metadata?.provider || user.identities?.[0]?.provider || 'email',
    display_name: display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'ユーザー',
    avatar_url,
    birth_date,
    partner_user_id,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabaseAdmin.from('profiles').upsert(values).select('id, display_name, avatar_url, birth_date, partner_user_id, updated_at').single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, profile: data });
}
