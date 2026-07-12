'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import RealtimeBars from '@/components/RealtimeBars';
import { demoAuthHeaders } from '@/lib/clientAuth';

type Candidate = { name: string; category?: string; reason?: string; comfort_score?: number };

export default function HostPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expectedCount, setExpectedCount] = useState(3);
  const [session, setSession] = useState<{ id: string; expected_count?: number } | null>(null);
  const [qr, setQr] = useState('');
  const [winner, setWinner] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { try { const value = new URLSearchParams(window.location.search).get('candidates'); setCandidates(value ? JSON.parse(value) : []); } catch { setError('候補の読み込みに失敗しました。フレンズモードからやり直してください。'); } }, []);
  async function create() {
    setError('');
    const response = await fetch('/api/sessions/create', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await demoAuthHeaders()) }, body: JSON.stringify({ mode: 'friends', expected_count: expectedCount, expires_in_minutes: 120, candidate_options: candidates }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? 'セッションを作成できませんでした');
    setSession(data.session);
    setQr(await QRCode.toDataURL(`${window.location.origin}/session/${data.session.id}`, { width: 360, margin: 2 }));
  }
  async function decide() {
    if (!session) return;
    const response = await fetch('/api/sessions/aggregate', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await demoAuthHeaders()) }, body: JSON.stringify({ sessionId: session.id }) });
    const data = await response.json();
    setWinner(data.aggregated?.winner || 'まだ投票がありません');
  }
  async function cancel() {
    if (!session || !window.confirm('この投票を中止しますか？投票は削除されます。')) return;
    const response = await fetch(`/api/sessions/${session.id}`, { method: 'DELETE', headers: await demoAuthHeaders() });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? '投票を中止できませんでした');
    setSession(null); setQr(''); setWinner('');
  }
  return <main className="min-h-screen bg-slate-950 p-5 text-white"><section className="mx-auto max-w-xl"><div className="flex justify-between"><Link href="/mypage" className="text-sm text-violet-300">← マイページに戻る</Link><Link href="/questions?mode=friends" className="text-sm text-violet-300">ほかの候補を探す</Link></div><p className="mt-8 text-amber-300">FRIENDS MODE</p><h1 className="mt-2 text-3xl font-bold">候補をみんなで決めよう</h1><p className="mt-3 text-slate-300">候補をしぼったら、QRを読んでもらって匿名投票。</p>{error && <p className="mt-6 rounded-xl bg-red-500/20 p-4 text-red-100">{error}</p>}<div className="mt-8 space-y-2">{candidates.map((candidate) => <div key={candidate.name} className="rounded-xl bg-white/10 p-4"><strong>{candidate.name}</strong><span className="ml-2 text-sm text-violet-200">{candidate.category}</span></div>)}</div>{!session && candidates.length > 0 && <div className="mt-7 flex gap-3"><label className="flex-1 text-sm text-slate-300">参加人数<input className="mt-2 w-full rounded-lg bg-white px-3 py-3 text-slate-900" type="number" min="1" value={expectedCount} onChange={(event) => setExpectedCount(Number(event.target.value))} /></label><button onClick={create} className="mt-6 h-12 rounded-xl bg-violet-600 px-5 font-semibold">QRを作る</button></div>}{session && <div className="mt-8 rounded-2xl bg-white p-5 text-slate-900"><img className="mx-auto w-full max-w-xs" src={qr} alt="投票用QRコード" /><p className="mt-3 text-center text-sm">みんなに読み取ってもらってください</p><div className="mt-6"><RealtimeBars sessionId={session.id} candidates={candidates} expectedCount={session.expected_count} /></div><button onClick={decide} className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 font-semibold text-white">多数決で決定する</button><button onClick={cancel} className="mt-3 w-full rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-700">投票をやめる</button>{winner && <p className="mt-5 rounded-xl bg-amber-100 p-4 text-center font-bold text-amber-900">決定：{winner}</p>}</div>}</section></main>;
}
