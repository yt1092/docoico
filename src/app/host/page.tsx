'use client';
import React, { useState } from 'react';
import QRCode from 'qrcode';
import RealtimeBars from '../../components/RealtimeBars';
import ResultModal from '../../components/ResultModal';

export default function HostPage() {
  const [mode, setMode] = useState<'couple' | 'friends' | 'solo'>('friends');
  const [session, setSession] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const [expectedCount, setExpectedCount] = useState<number | ''>('');

  async function createSession() {
    const res = await fetch('/api/sessions/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, expected_count: expectedCount || null }) });
    const data = await res.json();
    if (data?.ok && data.session) {
      setSession(data.session);
      const joinUrl = `${window.location.origin}/session/${data.session.id}`;
      const url = await QRCode.toDataURL(joinUrl, { width: 300 });
      setQrDataUrl(url);
    } else {
      alert('セッション作成に失敗しました');
    }
  }

  return (
    <main className="min-h-screen p-6">
      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">フレンズモード — ホスト作成</h2>
        <div className="mb-4">モード選択:</div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('couple')} className={`px-3 py-2 rounded ${mode === 'couple' ? 'bg-purple-600' : 'bg-gray-800'}`}>カップル</button>
          <button onClick={() => setMode('friends')} className={`px-3 py-2 rounded ${mode === 'friends' ? 'bg-purple-600' : 'bg-gray-800'}`}>フレンズ</button>
          <button onClick={() => setMode('solo')} className={`px-3 py-2 rounded ${mode === 'solo' ? 'bg-purple-600' : 'bg-gray-800'}`}>ソロ</button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <input type="number" min={1} value={expectedCount as any} onChange={(e) => setExpectedCount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="参加人数（任意）" className="px-3 py-2 rounded bg-gray-800" />
          <button onClick={createSession} className="px-4 py-3 bg-yellow-500 rounded font-semibold">セッションを作成してQRを表示</button>
        </div>

        {session && (
          <div className="bg-[#0f1113] p-4 rounded">
            <div className="mb-3">セッションID: <code className="text-sm text-gray-300">{session.id}</code></div>
            {qrDataUrl && <img src={qrDataUrl} alt="session-qr" className="mx-auto" />}
            <div className="mt-4">
              <RealtimeBars sessionId={session.id} expectedCount={session.expected_count} />
            </div>
            <div className="mt-4 text-center">
              <button onClick={() => {
                // trigger manual aggregate and show animated celebration (placeholder)
                fetch('/api/sessions/aggregate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: session.id }) })
                  .then(r => r.json())
                  .then(async (res) => res.json())
                      .then((json) => {
                        setResult(json.aggregated || null);
                      });
              }} className="px-4 py-2 bg-purple-600 rounded">手動で集計して提案</button>
            </div>
          </div>
        )}
            {result && <ResultModal result={result} onClose={() => setResult(null)} />}
      </section>
    </main>
  );
}
