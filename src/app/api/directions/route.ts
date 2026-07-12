import { NextResponse } from 'next/server';
import { requireDemoOwner } from '@/lib/demoAccess';

export async function GET(req: Request) {
  try {
    const access = await requireDemoOwner(req);
    if (!access.ok) return access.response;
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const mode = searchParams.get('mode') || 'driving';
    if (!origin || !destination) return NextResponse.json({ ok: false, error: 'origin & destination required' }, { status: 400 });

    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: false, error: 'GOOGLE_MAPS_API_KEY not set' }, { status: 400 });

    const transitTime = mode === 'transit' ? '&departure_time=now' : '';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(mode)}${transitTime}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ ok: false, error: `Directions error ${res.status}` }, { status: 502 });
    const data = await res.json();
    // Simplify response
    const route = data.routes?.[0];
    const leg = route?.legs?.[0];
    const steps = (leg?.steps || []).map((step: any) => ({
      travel_mode: step.travel_mode,
      duration: step.duration?.text,
      transit: step.transit_details ? {
        departure_stop: step.transit_details.departure_stop?.name,
        arrival_stop: step.transit_details.arrival_stop?.name,
        departure_time: step.transit_details.departure_time?.text,
        arrival_time: step.transit_details.arrival_time?.text,
        line: step.transit_details.line?.short_name || step.transit_details.line?.name
      } : undefined
    }));
    return NextResponse.json({ ok: true, duration: leg?.duration, distance: leg?.distance, overview_polyline: route?.overview_polyline, steps });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
