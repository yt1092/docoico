import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (!lat || !lng) return NextResponse.json({ ok: false, error: 'lat & lng required' }, { status: 400 });

    const url = `https://api.sunrise-sunset.org/json?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&formatted=0`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ ok: false, error: `Sunrise API error ${res.status}` }, { status: 502 });
    const data = await res.json();
    return NextResponse.json({ ok: true, results: data.results });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
