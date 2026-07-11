'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Candidate = { name: string; category?: string };

export default function SessionJoin({ params }: { params: { id: string } }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('候補を読み込んでいます…');
  useEffect(() => { fetch(`/api/sessions/${params.id}`).then((response) => response.json()).then((data) => { if (!data.ok) throw new Error(data.error); setCandidates(data.session.candidate_options ?? []); setMessage(''); }).catch((error) => setMessage(error.message)); }, [params.id]);
  async function vote() {
    if (!selected) return;
    const { error } = await supabase.from('votes').insert({ session_id: params.id, candidate_name: selected });
    setMessage(error ? '投票に失敗しました。もう一度お試しください。' : '投票しました！結果を待ちましょう。');
  }
  return <main className="min-h-screen bg-slate-950 p-5 text-white"><section className="mx-auto max-w-md"><p className="text-amber-300">DOCOICO FRIENDS</p><h1 className="mt-2 text-3xl font-bold">どこに行く？</h1><p className="mt-3 text-slate-300">いちばん行きたい候補を1つ選んでください。</p>{message && <p className="mt-8 rounded-xl bg-white/10 p-4 text-slate-200">{message}</p>}<div className="mt-8 space-y-3">{candidates.map((candidate) => <button key={candidate.name} onClick={() => setSelected(candidate.name)} className={`w-full rounded-2xl border p-5 text-left ${selected === candidate.name ? 'border-amber-300 bg-amber-300/15' : 'border-white/15 bg-white/5'}`}><strong>{candidate.name}</strong>{candidate.category && <span className="ml-2 text-sm text-violet-200">{candidate.category}</span>}</button>)}</div>{candidates.length > 0 && <button onClick={vote} disabled={!selected} className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-amber-500 px-5 py-4 font-semibold disabled:opacity-50">この候補に投票する</button>}</section></main>;
}
