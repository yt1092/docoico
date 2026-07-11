'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { demoAuthHeaders } from '@/lib/clientAuth';

type Mode = 'couple' | 'friends' | 'solo';
type Answer = Record<string, string>;
type Candidate = { name: string; category?: string; reason?: string; comfort_score?: number; lat?: number; lng?: number; google_place_id?: string };

const common = [
  { key: 'transport', title: 'どうやって行く？', options: ['徒歩', '電車', '車'] },
  { key: 'availableTime', title: '移動を含めて、どれくらい時間がある？', options: ['30分くらい', '1時間くらい', '2時間以上'] },
];

const byMode: Record<Mode, { key: string; title: string; options: string[] }[]> = {
  couple: [
    { key: 'mood', title: 'いまの気分は？', options: ['ゆっくり話したい', 'ときめきたい', 'おいしいもの重視', 'アクティブに遊びたい'] },
    { key: 'atmosphere', title: 'どんな雰囲気がいい？', options: ['おしゃれ', '落ち着いた', 'にぎやか', 'ロマンチック'] },
    { key: 'genre', title: '何をしたい？', options: ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'] },
    { key: 'budget', title: '予算感は？', options: ['リーズナブル', 'ちょうどよく', '少し奮発'] },
  ],
  friends: [
    { key: 'mood', title: 'みんなのテンションは？', options: ['ゆるく集まりたい', 'わいわいしたい', 'お腹ぺこぺこ', '思い出を作りたい'] },
    { key: 'atmosphere', title: '今日はどんな会にする？', options: ['気軽に', '写真映え', '落ち着いて話す', '盛り上がる'] },
    { key: 'genre', title: '候補のジャンルは？', options: ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'] },
    { key: 'budget', title: '1人あたりの予算は？', options: ['リーズナブル', 'ちょうどよく', '少し奮発'] },
  ],
  solo: [
    { key: 'mood', title: 'いまの気分は？', options: ['リフレッシュ', '集中したい', '自分を甘やかしたい', '新しい発見'] },
    { key: 'atmosphere', title: 'どんな時間にしたい？', options: ['静かに', '気分転換に', '刺激的に', 'のんびり'] },
    { key: 'genre', title: '何をしたい？', options: ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'] },
    { key: 'budget', title: '予算感は？', options: ['リーズナブル', 'ちょうどよく', '少し奮発'] },
  ],
};

export default function QuestionFlow({ mode }: { mode: Mode }) {
  const router = useRouter();
  const questions = [...common, ...byMode[mode]];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spots, setSpots] = useState<Candidate[] | null>(null);
  const current = questions[index];

  async function location() {
    if (!navigator.geolocation) return null;
    return new Promise<{ lat: number; lng: number } | null>((resolve) => navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null), { timeout: 5000, maximumAge: 60000 },
    ));
  }

  async function choose(value: string) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (index < questions.length - 1) return setIndex(index + 1);
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await demoAuthHeaders()) },
        body: JSON.stringify({ aggregated: next, location: await location() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? '候補を取得できませんでした');
      setSpots(data.parsed?.spots ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '候補を取得できませんでした');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="py-16 text-center text-violet-700">AIが今の条件に合う場所を探しています…</div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"><p>{error}</p><p className="mt-2 text-sm">デモ用に許可されたメールアドレスでログインしてからお試しください。</p><button className="mt-4 underline" onClick={() => setError('')}>質問に戻る</button></div>;

  if (spots) return <section className="space-y-4"><h3 className="text-2xl font-bold">おすすめ候補</h3>{spots.map((spot, i) => <button key={`${spot.name}-${i}`} onClick={() => router.push(`/map?name=${encodeURIComponent(spot.name)}&lat=${spot.lat ?? ''}&lng=${spot.lng ?? ''}&category=${encodeURIComponent(spot.category ?? '')}`)} className="block w-full rounded-2xl border border-violet-100 bg-white p-5 text-left shadow-sm"><div className="flex justify-between gap-3"><strong>{spot.name}</strong><span className="text-sm text-amber-700">快適度 {spot.comfort_score ?? '-'} </span></div><p className="mt-2 text-sm text-violet-700">{spot.category}</p><p className="mt-2 text-sm text-slate-600">{spot.reason}</p></button>)}{mode === 'friends' && spots.length > 0 && <button onClick={() => router.push(`/host?candidates=${encodeURIComponent(JSON.stringify(spots))}`)} className="w-full rounded-xl bg-violet-600 px-5 py-4 font-semibold text-white">この候補をQR投票に出す</button>}<button className="w-full py-2 text-sm text-slate-500" onClick={() => { setSpots(null); setIndex(0); setAnswers({}); }}>条件を変える</button></section>;

  return <AnimatePresence mode="wait"><motion.section key={current.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"><div className="flex justify-between"><h3 className="text-xl font-bold">{current.title}</h3><span className="text-sm text-slate-400">{index + 1}/{questions.length}</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{current.options.map((option) => <button key={option} onClick={() => choose(option)} className="rounded-xl border border-slate-200 px-4 py-4 text-left hover:border-violet-500 hover:bg-violet-50">{option}</button>)}</div>{index > 0 && <button className="mt-6 text-sm text-slate-500" onClick={() => setIndex(index - 1)}>戻る</button>}</motion.section></AnimatePresence>;
}
