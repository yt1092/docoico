'use client';
import React, { useEffect, useState } from 'react';

export default function LLMTester() {
  const [status, setStatus] = useState<{ hasKey?: boolean; enabled?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/llm/status').then(r => r.json()).then(data => setStatus(data));
  }, []);

  const test = async () => {
    setLoading(true);
    setResult(null);
    try {
      const sample = { aggregated: { total: 3, counts: { グルメ: 2, カフェ: 1 }, moods: { 'ちょうどよく': 3 } } };
      const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sample) });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="text-right text-sm text-gray-300">LLM: {status ? (status.enabled ? 'Enabled' : 'Disabled') : 'Loading...'}</div>
      <button onClick={test} disabled={loading} className="px-3 py-2 bg-indigo-600 rounded text-sm">呼び出しテスト</button>
      {loading && <div className="text-xs text-gray-400">呼び出し中…</div>}
      {result && <pre className="max-w-xs text-xs bg-[#0f1113] p-2 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
