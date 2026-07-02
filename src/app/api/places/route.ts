import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const keyword = searchParams.get('keyword') || '';
    if (!lat || !lng) return NextResponse.json({ ok: false, error: 'lat & lng required' }, { status: 400 });

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: false, error: 'GOOGLE_MAPS_API_KEY not set' }, { status: 400 });

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ ok: false, error: `Places error ${res.status}` }, { status: 502 });
    const data = await res.json();

    const places = (data.results || []).map((p: any) => ({ id: p.place_id, name: p.name, lat: p.geometry?.location?.lat, lng: p.geometry?.location?.lng, rating: p.rating, user_ratings_total: p.user_ratings_total }));
    return NextResponse.json({ ok: true, places, status: data.status });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
