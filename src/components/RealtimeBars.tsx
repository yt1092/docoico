'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

const GENRES = ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'];

export default function RealtimeBars({ sessionId, expectedCount }: { sessionId: string; expectedCount?: number | null }) {
  const [counts, setCounts] = useState<Record<string, number>>(() => GENRES.reduce((acc, g) => ({ ...acc, [g]: 0 }), {}));
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.from('votes').select('*').eq('session_id', sessionId);
      if (!mounted) return;
      const tally = GENRES.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<string, number>);
      (data || []).forEach((v: any) => {
        const g = v.genre || 'その他';
        if (tally[g] !== undefined) tally[g]++;
      });
      setCounts(tally);
    }

    load();

    const subscription = supabase
      .channel(`public:votes:session=${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes', filter: `session_id=eq.${sessionId}` }, (payload) => {
        const newVote = payload.new as any;
        const g = newVote.genre || 'その他';
        setCounts(prev => ({ ...prev, [g]: (prev[g] ?? 0) + 1 }));
      })
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(subscription);
      } catch (e) {}
    };
  }, [sessionId]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (expectedCount && total >= expectedCount) setFinished(true);
    if (expectedCount && total >= expectedCount) {
      // trigger aggregation on server
      fetch('/api/sessions/aggregate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) }).catch(() => {});
    }

  const displayTotal = total || 1;

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between text-sm mb-2">
        <div>合計: {displayTotal}票</div>
        {expectedCount ? <div>目標人数: {expectedCount}人</div> : null}
        {finished ? <div className="text-green-300">全員回答済み</div> : null}
      </div>

      {GENRES.map(g => {
        const value = counts[g] ?? 0;
        const pct = Math.round((value / displayTotal) * 100);
        return (
          <div key={g}>
            <div className="flex justify-between text-sm mb-1">
              <div>{g}</div>
              <div>{value}票</div>
            </div>
            <div className="bg-gray-800 h-4 rounded overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-4 bg-gradient-to-r from-purple-600 to-yellow-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
