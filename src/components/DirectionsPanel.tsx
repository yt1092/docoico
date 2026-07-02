'use client';
import React, { useState } from 'react';

export default function DirectionsPanel({ origin, destination }: { origin?: string; destination?: string }) {
  const [mode, setMode] = useState<'walking'|'driving'|'transit'>('walking');
  const [result, setResult] = useState<any>(null);

  async function getDirections() {
    const url = `/api/directions?origin=${encodeURIComponent(origin || '')}&destination=${encodeURIComponent(destination || '')}&mode=${mode}`;
    const res = await fetch(url);
    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="bg-[#0f1113] p-3 rounded">
      <div className="mb-2">移動手段:</div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('walking')} className={`px-3 py-2 rounded ${mode==='walking'?'bg-purple-600':''}`}>徒歩</button>
        <button onClick={() => setMode('transit')} className={`px-3 py-2 rounded ${mode==='transit'?'bg-purple-600':''}`}>電車</button>
        <button onClick={() => setMode('driving')} className={`px-3 py-2 rounded ${mode==='driving'?'bg-purple-600':''}`}>車</button>
      </div>
      <button onClick={getDirections} className="px-4 py-2 bg-yellow-500 rounded">ルート取得</button>
      {result && <pre className="mt-3 text-sm">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
