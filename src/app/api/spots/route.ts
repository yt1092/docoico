import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('spots').select('*').limit(100);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, spots: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// Upserts a spot (e.g. one surfaced by an AI recommendation) so it can be
// referenced by favorites/history, which store a spot_id foreign key.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, lat, lng, google_place_id, comfort_score, instagram_url } = body;
    if (!name || lat == null || lng == null) {
      return NextResponse.json({ ok: false, error: 'name, lat, lng required' }, { status: 400 });
    }

    if (google_place_id) {
      const { data: existing } = await supabaseAdmin.from('spots').select('*').eq('google_place_id', google_place_id).limit(1).maybeSingle();
      if (existing) return NextResponse.json({ ok: true, spot: existing });
    }

    const { data, error } = await supabaseAdmin
      .from('spots')
      .insert([{ name, category, lat, lng, google_place_id, comfort_score, instagram_url }])
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, spot: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
