import { NextResponse } from 'next/server';
import { requireDemoOwner } from '@/lib/demoAccess';

export async function GET(req: Request) {
  try {
    const access = await requireDemoOwner(req);
    if (!access.ok) return access.response;
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (!lat || !lng) return NextResponse.json({ ok: false, error: 'lat & lng required' }, { status: 400 });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: false, error: 'OPENWEATHER_API_KEY not set' }, { status: 400 });

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ ok: false, error: `OpenWeather error ${res.status}` }, { status: 502 });
    const data = await res.json();
    return NextResponse.json({ ok: true, weather: { main: data.weather?.[0]?.main, description: data.weather?.[0]?.description, temp: data.main?.temp, humidity: data.main?.humidity } });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
