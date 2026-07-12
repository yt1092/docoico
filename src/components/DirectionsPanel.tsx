'use client';

import React, { useEffect, useState } from 'react';
import { demoAuthHeaders } from '../lib/clientAuth';
import { decodePolyline } from '../lib/polyline';

type TravelMode = 'walking' | 'driving' | 'transit';
type TransitStep = { departure_stop?: string; arrival_stop?: string; departure_time?: string; arrival_time?: string; line?: string };
type RouteStep = { travel_mode?: string; duration?: string; transit?: TransitStep };

export default function DirectionsPanel({ origin, destination, initialMode = 'walking', onRoute }: { origin?: string; destination?: string; initialMode?: TravelMode; onRoute?: (path: { lat: number; lng: number }[]) => void }) {
  const [mode, setMode] = useState<TravelMode>(initialMode);
  const [summary, setSummary] = useState<{ duration?: string; distance?: string; steps?: RouteStep[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMode(initialMode), [initialMode]);

  async function getDirections() {
    setLoading(true); setError(null);
    try {
      const url = `/api/directions?origin=${encodeURIComponent(origin || '')}&destination=${encodeURIComponent(destination || '')}&mode=${mode}`;
      const res = await fetch(url, { headers: await demoAuthHeaders() });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'ルートを取得できませんでした');
      setSummary({ duration: data.duration?.text, distance: data.distance?.text, steps: data.steps });
      if (data.overview_polyline?.points && onRoute) onRoute(decodePolyline(data.overview_polyline.points));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ルートを取得できませんでした'); setSummary(null);
    } finally { setLoading(false); }
  }

  return <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"><div className="mb-2 text-gray-600">移動手段:</div><div className="flex gap-2 mb-3"><button onClick={() => setMode('walking')} className={`px-3 py-2 rounded-lg ${mode === 'walking' ? 'bg-violet-600 text-white' : 'bg-gray-50 text-gray-600'}`}>徒歩</button><button onClick={() => setMode('transit')} className={`px-3 py-2 rounded-lg ${mode === 'transit' ? 'bg-violet-600 text-white' : 'bg-gray-50 text-gray-600'}`}>電車</button><button onClick={() => setMode('driving')} className={`px-3 py-2 rounded-lg ${mode === 'driving' ? 'bg-violet-600 text-white' : 'bg-gray-50 text-gray-600'}`}>車</button></div><button onClick={getDirections} disabled={loading} className="px-4 py-2 bg-amber-500 text-white rounded-lg disabled:opacity-60">{loading ? '検索中…' : 'ルート取得'}</button>{summary && <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3"><div>所要時間: <strong>{summary.duration ?? '-'}</strong></div><div>距離: <strong>{summary.distance ?? '-'}</strong></div>{mode === 'transit' && summary.steps?.filter(step => step.transit).map((step, index) => <div key={index} className="mt-3 border-t pt-2"><strong>{step.transit?.line ?? '電車'}</strong><div>{step.transit?.departure_stop} → {step.transit?.arrival_stop}</div><div>乗車 {step.transit?.departure_time ?? '-'} / 到着 {step.transit?.arrival_time ?? '-'}</div></div>)}</div>}{error && <div className="mt-2 text-xs text-red-500">{error}</div>}</div>;
}
