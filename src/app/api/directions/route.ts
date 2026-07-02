import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const mode = searchParams.get('mode') || 'driving';
    if (!origin || !destination) return NextResponse.json({ ok: false, error: 'origin & destination required' }, { status: 400 });

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: false, error: 'GOOGLE_MAPS_API_KEY not set' }, { status: 400 });

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(mode)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ ok: false, error: `Directions error ${res.status}` }, { status: 502 });
    const data = await res.json();
    // Simplify response
    const route = data.routes?.[0];
    const leg = route?.legs?.[0];
    return NextResponse.json({ ok: true, duration: leg?.duration, distance: leg?.distance, overview_polyline: route?.overview_polyline });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
