'use client';

import React, { useEffect, useState } from 'react';
import { demoAuthHeaders } from '../lib/clientAuth';
import { decodePolyline } from '../lib/polyline';

type TravelMode = 'walking' | 'driving' | 'transit' | 'bus';
type TransitStep = { departure_stop?: string; arrival_stop?: string; departure_time?: string; arrival_time?: string; line?: string };
type RouteStep = { travel_mode?: string; duration?: string; transit?: TransitStep };

const modeStyle: Record<TravelMode, { active: string; route: string; label: string }> = {
  walking: { active: 'bg-emerald-600 text-white', route: '#059669', label: '徒歩' },
  transit: { active: 'bg-blue-600 text-white', route: '#2563eb', label: '電車' },
  bus: { active: 'bg-orange-600 text-white', route: '#ea580c', label: 'バス' },
  driving: { active: 'bg-violet-600 text-white', route: '#7c3aed', label: '車' }
};

export default function DirectionsPanel({ origin, destination, initialMode = 'walking', onRoute }: { origin?: string; destination?: string; initialMode?: TravelMode; onRoute?: (path: { lat: number; lng: number }[], color: string) => void }) {
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
      if (!data.ok) throw new Error(data.error || 'ルートを取得できませんでした。');
      setSummary({ duration: data.duration?.text, distance: data.distance?.text, steps: data.steps });
      if (data.overview_polyline?.points && onRoute) onRoute(decodePolyline(data.overview_polyline.points), modeStyle[mode].route);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ルートを取得できませんでした。'); setSummary(null);
    } finally { setLoading(false); }
  }

  return <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
    <div className="mb-2 text-gray-600">移動手段（色は地図のルートにも反映されます）</div>
    <div className="grid grid-cols-2 gap-2 mb-3">
      {(Object.keys(modeStyle) as TravelMode[]).map(key => <button key={key} onClick={() => setMode(key)} className={`px-3 py-2 rounded-lg ${mode === key ? modeStyle[key].active : 'bg-gray-50 text-gray-600'}`}>{modeStyle[key].label}</button>)}
    </div>
    <button onClick={getDirections} disabled={loading} className={`px-4 py-2 text-white rounded-lg disabled:opacity-60 ${modeStyle[mode].active}`}>{loading ? '読み込み中…' : `${modeStyle[mode].label}ルートを取得`}</button>
    {summary && <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3"><div>所要時間: <strong>{summary.duration ?? '-'}</strong></div><div>距離: <strong>{summary.distance ?? '-'}</strong></div>{(mode === 'transit' || mode === 'bus') && summary.steps?.filter(step => step.transit).map((step, index) => <div key={index} className="mt-3 border-t pt-2"><strong>{step.transit?.line ?? modeStyle[mode].label}</strong><div>{step.transit?.departure_stop} → {step.transit?.arrival_stop}</div><div>出発 {step.transit?.departure_time ?? '-'} / 到着 {step.transit?.arrival_time ?? '-'}</div></div>)}</div>}
    {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
  </div>;
}
