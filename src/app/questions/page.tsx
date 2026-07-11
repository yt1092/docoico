'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import QuestionFlow from '@/components/QuestionFlow';

const labels = { couple: 'カップル', friends: 'フレンズ', solo: 'ソロ' } as const;

export default function QuestionsPage() {
  const raw = useSearchParams().get('mode');
  const mode = raw === 'couple' || raw === 'friends' || raw === 'solo' ? raw : 'solo';
  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-900"><section className="mx-auto max-w-xl"><Link href="/" className="text-sm text-violet-300">← モード選択へ</Link><p className="mt-8 text-sm font-medium text-amber-300">{labels[mode]} MODE</p><h1 className="mt-2 text-3xl font-bold text-white">いまの予定を教えて</h1><p className="mt-3 mb-8 text-slate-300">移動できる範囲から、AIが候補をしぼり込みます。</p><QuestionFlow mode={mode} /></section></main>;
}
