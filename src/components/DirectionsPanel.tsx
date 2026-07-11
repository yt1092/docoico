'use client';
import React, { useState } from 'react';
import { decodePolyline } from '../lib/polyline';

export default function DirectionsPanel({
  origin,
  destination,
  onRoute
}: {
  origin?: string;
  destination?: string;
  onRoute?: (path: { lat: number; lng: number }[]) => void;
}) {
  const [mode, setMode] = useState<'walking' | 'driving' | 'transit'>('walking');
  const [summary, setSummary] = useState<{ duration?: string; distance?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function getDirections() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/directions?origin=${encodeURIComponent(origin || '')}&destination=${encodeURIComponent(destination || '')}&mode=${mode}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'ルートを取得できませんでした');
        setSummary(null);
        return;
      }
      setSummary({ duration: data.duration?.text, distance: data.distance?.text });
      const points = data.overview_polyline?.points;
      if (points && onRoute) onRoute(decodePolyline(points));
    } catch (e) {
      setError('ルートを取得できませんでした');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-2 text-gray-600">移動手段:</div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('walking')} className={`px-3 py-2 rounded-lg transition ${mode === 'walking' ? 'bg-violet-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>徒歩</button>
        <button onClick={() => setMode('transit')} className={`px-3 py-2 rounded-lg transition ${mode === 'transit' ? 'bg-violet-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>電車</button>
        <button onClick={() => setMode('driving')} className={`px-3 py-2 rounded-lg transition ${mode === 'driving' ? 'bg-violet-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>車</button>
      </div>
      <button onClick={getDirections} disabled={loading} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-60">
        {loading ? '取得中…' : 'ルート取得'}
      </button>
      {summary && (
        <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3">
          <div>所要時間: <span className="font-semibold">{summary.duration ?? '不明'}</span></div>
          <div>距離: <span className="font-semibold">{summary.distance ?? '不明'}</span></div>
        </div>
      )}
      {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
    </div>
  );
}
