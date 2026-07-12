import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const { data: userData } = await supabaseAdmin.auth.getUser(token);
  const user = userData.user;
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) return NextResponse.json({ ok: false, error: '画像ファイルを選択してください。' }, { status: 400 });
  if (file.size > 3 * 1024 * 1024) return NextResponse.json({ ok: false, error: '画像は3MB以下にしてください。' }, { status: 400 });

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/avatar.${extension}`;
  const { error } = await supabaseAdmin.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(path);
  const avatar_url = `${data.publicUrl}?v=${Date.now()}`;
  const { error: profileError } = await supabaseAdmin.from('profiles').update({ avatar_url, updated_at: new Date().toISOString() }).eq('id', user.id);
  if (profileError) return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
  return NextResponse.json({ ok: true, avatar_url });
}
