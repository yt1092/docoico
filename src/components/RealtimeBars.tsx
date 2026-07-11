'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RealtimeBars({ sessionId, candidates, expectedCount }: { sessionId: string; candidates: { name: string }[]; expectedCount?: number | null }) {
  const initial = useMemo(() => Object.fromEntries(candidates.map((candidate) => [candidate.name, 0])) as Record<string, number>, [candidates]);
  const [counts, setCounts] = useState<Record<string, number>>(initial);

  useEffect(() => {
    setCounts(initial);
    const load = async () => {
      const { data } = await supabase.from('votes').select('candidate_name').eq('session_id', sessionId);
      setCounts((previous) => (data ?? []).reduce((next, vote: { candidate_name?: string }) => vote.candidate_name && next[vote.candidate_name] !== undefined ? { ...next, [vote.candidate_name]: next[vote.candidate_name] + 1 } : next, { ...previous }));
    };
    load();
    const channel = supabase.channel(`session-votes-${sessionId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes', filter: `session_id=eq.${sessionId}` }, ({ new: vote }) => {
      const name = (vote as { candidate_name?: string }).candidate_name;
      if (name) setCounts((previous) => previous[name] === undefined ? previous : { ...previous, [name]: previous[name] + 1 });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [initial, sessionId]);

  const total = (Object.values(counts) as number[]).reduce((sum, count) => sum + count, 0);
  return <div className="space-y-4"><div className="flex justify-between text-sm text-slate-600"><span>投票 {total}票</span>{expectedCount ? <span>目標 {expectedCount}人</span> : null}</div>{candidates.map((candidate) => { const count = counts[candidate.name] ?? 0; const width = total ? Math.round((count / total) * 100) : 0; return <div key={candidate.name}><div className="mb-1 flex justify-between text-sm"><span>{candidate.name}</span><span>{count}票</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><motion.div className="h-full bg-gradient-to-r from-violet-600 to-amber-400" animate={{ width: `${width}%` }} /></div></div>; })}</div>;
}
