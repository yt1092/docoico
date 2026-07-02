'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Answer = { mood?: string; atmosphere?: string; genre?: string; budget?: string };

const questions = [
  { key: 'mood', title: '気分', options: ['がっつり', 'ちょうどよく', '軽く'] },
  { key: 'atmosphere', title: '雰囲気', options: ['おしゃれ', '落ち着いた', '活気ある'] },
  { key: 'genre', title: 'ジャンル', options: ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'] },
  { key: 'budget', title: '予算', options: ['リーズナブル', 'ちょうどよく', '奮発'] }
];

export default function QuestionFlow() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const current = questions[index];

  function choose(option: string) {
    setAnswers(prev => ({ ...prev, [current.key]: option }));
    if (index + 1 < questions.length) setIndex(i => i + 1);
    else submit({ ...answers, [current.key]: option });
  }

  async function submit(payload: Answer) {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="bg-[#111018] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{current.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {current.options.map(opt => (
                <button key={opt} onClick={() => choose(opt)} className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700">
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {loading && <div className="text-center text-gray-300">AIで提案中…</div>}

      {result && (
        <div className="bg-[#0f1113] p-4 rounded mt-4">
          <pre className="text-sm text-gray-200">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
