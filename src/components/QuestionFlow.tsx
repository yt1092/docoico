'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { demoAuthHeaders } from '@/lib/clientAuth';

type Mode = 'couple' | 'friends' | 'solo';
type Answer = Record<string, string>;
type Candidate = { name: string; category?: string; reason?: string; comfort_score?: number; lat?: number; lng?: number; google_place_id?: string };
type Question = { key: string; title: string; options?: string[]; input?: 'number' };

const common: Question[] = [
  { key: 'transport', title: 'どうやって行く？', options: ['徒歩', '電車', 'バス', '車'] },
  { key: 'availableTime', title: '移動を含めて、どれくらい時間がある？', options: ['30分くらい', '1時間くらい', '2時間以上'] },
  { key: 'age', title: '年齢を入力してください', input: 'number' }
];

const modeQuestions: Record<Mode, Question[]> = {
  couple: [
    { key: 'mood', title: 'いまの気分は？', options: ['ゆっくり話したい', 'ときめきたい', 'おいしいものを食べたい', 'アクティブに遊びたい'] },
    { key: 'atmosphere', title: 'どんな雰囲気がいい？', options: ['おしゃれ', '落ち着いた', 'にぎやか', 'ロマンチック'] },
    { key: 'genre', title: '何をしたい？', options: ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'] },
    { key: 'budget', title: '予算は？', options: ['リーズナブル', 'ちょうどよく', '奮発'] }
  ],
  friends: [
    { key: 'mood', title: 'みんなのテンションは？', options: ['ゆるく集まりたい', 'わいわいしたい', '外で遊びたい', '思い出を作りたい'] },
    { key: 'atmosphere', title: '今日はどんな場にする？', options: ['開放的に', '静かめに', 'にぎやかに', '盛り上がる'] },
    { key: 'genre', title: '希望ジャンルは？', options: ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'] },
    { key: 'budget', title: '1人あたりの予算は？', options: ['リーズナブル', 'ちょうどよく', '奮発'] }
  ],
  solo: [
    { key: 'mood', title: 'いまの気分は？', options: ['リフレッシュ', '集中したい', '自分を甘やかしたい', '新しい発見'] },
    { key: 'atmosphere', title: 'どんな時間にしたい？', options: ['静かに', '落ち着いた空間で', '活気のある所で', 'のんびり'] },
    { key: 'genre', title: '何をしたい？', options: ['グルメ', 'カフェ', 'アミューズメント', 'ショッピング'] },
    { key: 'budget', title: '予算は？', options: ['リーズナブル', 'ちょうどよく', '奮発'] }
  ]
};

export default function QuestionFlow({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [ageInput, setAgeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spots, setSpots] = useState<Candidate[] | null>(null);
  const [shared, setShared] = useState<string | null>(null);
  const questions = useMemo(() => {
    const adult = Number(answers.age) >= 20;
    return [...common, ...modeQuestions[mode].map(question => question.key === 'genre' && adult ? { ...question, options: [...(question.options || []), '居酒屋・バー'] } : question)];
  }, [answers.age, mode]);
  const current = questions[index];

  async function location() {
    if (!navigator.geolocation) return null;
    return new Promise<{ lat: number; lng: number } | null>((resolve) => navigator.geolocation.getCurrentPosition(
      position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null), { timeout: 5000, maximumAge: 60000 }
    ));
  }

  async function recommend(next: Answer) {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await demoAuthHeaders()) }, body: JSON.stringify({ aggregated: next, location: await location() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '候補を取得できませんでした。');
      setSpots(data.parsed?.spots || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : '候補を取得できませんでした。'); }
    finally { setLoading(false); }
  }

  async function choose(value: string) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (index < questions.length - 1) setIndex(index + 1);
    else await recommend(next);
  }

  async function submitAge(event: FormEvent) {
    event.preventDefault();
    const age = Number(ageInput);
    if (!Number.isInteger(age) || age < 1 || age > 120) return setError('1〜120歳の範囲で入力してください。');
    await choose(String(age));
  }

  async function openSpot(spot: Candidate) {
    if (mode === 'couple') {
      try {
        const response = await fetch('/api/couple/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await demoAuthHeaders()) }, body: JSON.stringify(spot) });
        const result = await response.json();
        setShared(response.ok ? '恋人へ候補を共有しました。' : result.error || '共有できませんでした。');
      } catch { setShared('恋人への共有に失敗しました。'); }
    }
    const params = new URLSearchParams({ name: spot.name, lat: String(spot.lat || ''), lng: String(spot.lng || ''), category: spot.category || '', transport: answers.transport || '徒歩' });
    router.push(`/map?${params.toString()}`);
  }

  if (loading) return <div className="py-16 text-center text-violet-700">AIがリアルタイムの条件をもとに候補を探しています…</div>;
  if (error && !spots) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"><p>{error}</p><button className="mt-4 underline" onClick={() => setError('')}>質問に戻る</button></div>;
  if (spots) return <section className="space-y-4"><h3 className="text-2xl font-bold">おすすめ候補</h3>{shared && <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-700">{shared}</p>}{spots.map((spot, i) => <button key={`${spot.name}-${i}`} onClick={() => openSpot(spot)} className="block w-full rounded-2xl border border-violet-100 bg-white p-5 text-left shadow-sm"><div className="flex justify-between gap-3"><strong>{spot.name}</strong><span className="text-sm text-amber-700">快適度 {spot.comfort_score ?? '-'}</span></div><p className="mt-2 text-sm text-violet-700">{spot.category}</p><p className="mt-2 text-sm text-slate-600">{spot.reason}</p></button>)}{mode === 'friends' && spots.length > 0 && <button onClick={() => router.push(`/host?candidates=${encodeURIComponent(JSON.stringify(spots))}`)} className="w-full rounded-xl bg-violet-600 px-5 py-4 font-semibold text-white">この候補をQR投票に出す</button>}<button className="w-full rounded-xl border border-violet-300 px-5 py-3 font-semibold text-violet-700" onClick={() => recommend(answers)}>ほかの候補を探す</button><button className="w-full py-2 text-sm text-slate-500" onClick={() => { setSpots(null); setIndex(0); setAnswers({}); setAgeInput(''); }}>質問を変える</button></section>;

  return <AnimatePresence mode="wait"><motion.section key={current.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"><div className="flex justify-between"><h3 className="text-xl font-bold">{current.title}</h3><span className="text-sm text-slate-400">{index + 1}/{questions.length}</span></div>{current.input === 'number' ? <form onSubmit={submitAge} className="mt-6 space-y-3"><input autoFocus value={ageInput} onChange={event => setAgeInput(event.target.value)} inputMode="numeric" type="number" min="1" max="120" placeholder="例：20" className="w-full rounded-xl border border-slate-200 px-4 py-4" /><p className="text-xs text-slate-500">20歳未満の方には、居酒屋・バーなどお酒が中心の候補は提案しません。</p><button className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white">次へ</button></form> : <div className="mt-6 grid gap-3 sm:grid-cols-2">{current.options?.map(option => <button key={option} onClick={() => choose(option)} className="rounded-xl border border-slate-200 px-4 py-4 text-left hover:border-violet-500 hover:bg-violet-50">{option}</button>)}</div>}{error && <p className="mt-3 text-sm text-red-600">{error}</p>}{index > 0 && <button className="mt-6 text-sm text-slate-500" onClick={() => { setError(''); setIndex(index - 1); }}>戻る</button>}</motion.section></AnimatePresence>;
}
