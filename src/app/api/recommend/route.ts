import { NextResponse } from 'next/server';
import { requireDemoOwner } from '@/lib/demoAccess';

type Candidate = { name: string; place_id?: string; rating?: number; user_ratings_total?: number; lat?: number; lng?: number };
type LatLng = { lat: number; lng: number };

function topKey(record?: Record<string, number>): string | undefined {
  if (!record) return undefined;
  const entries = Object.entries(record);
  if (!entries.length) return undefined;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

async function fetchWeather(loc: LatLng) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lng}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return { description: data.weather?.[0]?.description as string | undefined, temp: data.main?.temp as number | undefined };
  } catch {
    return null;
  }
}

async function fetchNearbyPlaces(loc: LatLng, keyword: string): Promise<Candidate[]> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc.lat},${loc.lng}&radius=2000&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 5).map((p: any) => ({
      name: p.name,
      place_id: p.place_id,
      rating: p.rating,
      user_ratings_total: p.user_ratings_total,
      lat: p.geometry?.location?.lat,
      lng: p.geometry?.location?.lng
    }));
  } catch {
    return [];
  }
}

async function fetchTrafficRatio(origin: LatLng, dest: LatLng): Promise<number | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&mode=driving&departure_time=now&traffic_model=best_guess&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const leg = data.routes?.[0]?.legs?.[0];
    if (!leg?.duration?.value || !leg?.duration_in_traffic?.value) return null;
    return leg.duration_in_traffic.value / leg.duration.value;
  } catch {
    return null;
  }
}

function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(meters: number): string {
  if (meters < 1200) return `徒歩${Math.max(1, Math.round(meters / 80))}分`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function buildFallbackSpots(
  candidates: Candidate[],
  location: LatLng | null,
  genre: string,
  atmosphere: string,
  congestionLabel: string,
  trafficLabel: string
) {
  return candidates
    .map(c => {
      let score = c.rating != null ? Math.round((c.rating / 5) * 100) : 60;
      if (congestionLabel === '空いている') score += 5;
      if (congestionLabel === '混雑') score -= 5;
      if (trafficLabel === '順調') score += 5;
      if (trafficLabel === '渋滞あり') score -= 5;
      score = Math.max(0, Math.min(100, score));

      const distance = location && c.lat != null && c.lng != null ? formatDistance(haversineMeters(location, { lat: c.lat, lng: c.lng })) : undefined;

      const ratingText = c.rating != null ? `評価${c.rating}（${c.user_ratings_total ?? 0}件のレビュー）` : '評価情報なし';
      const reason = `${ratingText}。「${atmosphere}」な雰囲気を探している方向けで、現在の混雑状況は${congestionLabel}です。`;

      return {
        name: c.name,
        category: genre,
        reason,
        comfort_score: score,
        distance,
        lat: c.lat,
        lng: c.lng,
        google_place_id: c.place_id,
        _score: score
      };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 3)
    .map(({ _score, ...rest }) => rest);
}

async function fetchBuzzScore(query: string): Promise<number | null> {
  const xToken = process.env.TWITTER_BEARER_TOKEN;
  if (!xToken || !query) return null;
  try {
    const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10`, {
      headers: { Authorization: `Bearer ${xToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const count = data.meta?.result_count ?? (Array.isArray(data.data) ? data.data.length : 0);
    return Math.min(100, count * 10);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const access = await requireDemoOwner(req);
    if (!access.ok) return access.response;
    const body = await req.json();
    const aggregated = body.aggregated ?? body;
    const location: LatLng | null = body.location ?? null;

    const genre = aggregated?.genre || topKey(aggregated?.counts) || '';
    const mood = aggregated?.mood || topKey(aggregated?.moods) || '不明';
    const atmosphere = aggregated?.atmosphere || topKey(aggregated?.atmos) || '不明';
    const budget = aggregated?.budget || topKey(aggregated?.budgets) || '不明';

    const [weather, candidates] = await Promise.all([
      location ? fetchWeather(location) : Promise.resolve(null),
      location && genre ? fetchNearbyPlaces(location, genre) : Promise.resolve([] as Candidate[])
    ]);

    const top = candidates[0];
    const [trafficRatio, buzzScore] = await Promise.all([
      location && top?.lat != null && top?.lng != null ? fetchTrafficRatio(location, { lat: top.lat, lng: top.lng }) : Promise.resolve(null),
      fetchBuzzScore(genre)
    ]);

    const ratings = candidates.map(c => c.rating).filter((r): r is number => typeof r === 'number');
    const sentimentScore = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length / 5) * 100) : null;

    const reviewCounts = candidates.map(c => c.user_ratings_total).filter((n): n is number => typeof n === 'number');
    const avgReviews = reviewCounts.length ? reviewCounts.reduce((a, b) => a + b, 0) / reviewCounts.length : null;
    const congestionLabel = avgReviews == null ? '取得不可' : avgReviews > 1000 ? '混雑' : avgReviews > 200 ? '普通' : '空いている';
    const trafficLabel = trafficRatio == null ? '取得不可' : trafficRatio > 1.3 ? '渋滞あり' : trafficRatio > 1.1 ? 'やや混雑' : '順調';

    const locationStr = location ? `緯度${location.lat.toFixed(3)}, 経度${location.lng.toFixed(3)}` : '不明';
    const timeStr = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const weatherStr = weather?.description || '取得不可';
    const tempStr = weather?.temp != null ? String(Math.round(weather.temp)) : '不明';
    const candidateStr = candidates.length
      ? candidates.map(c => `${c.name}（評価${c.rating ?? '不明'}, レビュー${c.user_ratings_total ?? 0}件）`).join(' / ')
      : 'なし';

    const prompt = `現在地：${locationStr}
現在時刻：${timeStr}
天気：${weatherStr}、気温：${tempStr}度
ユーザーの気分：${mood}
希望する雰囲気：${atmosphere}
希望ジャンル：${genre || '不明'}
予算：${budget}
現在の混雑状況：${congestionLabel}
渋滞状況：${trafficLabel}
SNSバズりスコア：${buzzScore ?? '取得不可'}
口コミ感情スコア：${sentimentScore ?? '取得不可'}
周辺候補：${candidateStr}

以上の条件から、今この瞬間最適なスポットを3件提案してください。周辺候補があれば優先的に参考にしてください。各スポットについて以下のJSON形式で返してください。
{ "spots": [ { "name": "", "category": "", "reason": "", "comfort_score": 0, "distance": "", "instagram_url": "" } ] }`;

    const geminiKey = process.env.GEMINI_API_KEY;
    const enableGemini = process.env.ENABLE_GEMINI === 'false' ? false : Boolean(geminiKey);

    if (!enableGemini || !geminiKey) {
      // LLM disabled or key missing: fall back to a rule-based ranking of real nearby places
      // (rating + review count + live congestion/traffic signals), no paid API required.
      if (candidates.length) {
        const spots = buildFallbackSpots(candidates, location, genre || 'スポット', atmosphere, congestionLabel, trafficLabel);
        return NextResponse.json({ ok: true, enabled: false, parsed: { spots } });
      }
      return NextResponse.json({ ok: true, enabled: false, prompt });
    }

    // Gemini API (Google Generative Language API) generateContent endpoint.
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const geminiUrl = process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const res = await fetch(`${geminiUrl}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ ok: false, error: `LLM request failed: ${res.status} ${txt}` }, { status: 502 });
    }

    const llmResponse = await res.json();
    const rawText: string = llmResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse JSON from the LLM text. Find first JSON object or array in text.
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // attempt to extract JSON substring
      const m = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch (e2) {
          parsed = null;
        }
      }
    }

    if (parsed) {
      return NextResponse.json({ ok: true, enabled: true, parsed });
    }

    // Fallback: return raw text
    return NextResponse.json({ ok: true, enabled: true, raw: rawText, llm: llmResponse });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 400 });
  }
}
