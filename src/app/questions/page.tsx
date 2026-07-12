'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuestionFlow from '@/components/QuestionFlow';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

const labels = { couple: 'カップル', friends: 'フレンズ', solo: 'ソロ' } as const;

export default function QuestionsPage() {
  const raw = useSearchParams().get('mode');
  const mode = raw === 'couple' || raw === 'friends' || raw === 'solo' ? raw : 'solo';
  const router = useRouter();
  const { user } = useAuth();
  const [checkingCouple, setCheckingCouple] = useState(mode === 'couple');
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (mode !== 'couple') return;
    async function checkCoupleProfile() {
      if (!user) { setBlocked(true); setCheckingCouple(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setBlocked(true); setCheckingCouple(false); return; }
      const response = await fetch('/api/profile', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await response.json();
      if (!data.ok || !data.profile?.partner_user_id) setBlocked(true);
      setCheckingCouple(false);
    }
    checkCoupleProfile();
  }, [mode, user]);

  useEffect(() => {
    if (!blocked) return;
    const timeout = window.setTimeout(() => router.replace('/mypage?setup=couple'), 1800);
    return () => window.clearTimeout(timeout);
  }, [blocked, router]);

  if (checkingCouple) return <main className="min-h-screen grid place-items-center bg-slate-950 text-white">カップル設定を確認しています…</main>;
  if (blocked) return <main className="min-h-screen grid place-items-center bg-slate-950 p-6"><section className="max-w-md rounded-2xl border border-amber-300 bg-white p-6 text-center shadow-xl"><p className="text-3xl">💌</p><h1 className="mt-3 text-xl font-bold text-slate-900">恋人のメールアドレスを設定してください</h1><p className="mt-3 text-sm text-slate-600">カップルモードは、マイページの設定から恋人のログイン用メールアドレスを登録してから利用できます。</p><p className="mt-4 text-sm text-violet-600">マイページへ移動します…</p></section></main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-900"><section className="mx-auto max-w-xl"><div className="flex justify-between"><Link href="/mypage" className="text-sm text-violet-300">← マイページに戻る</Link><Link href="/" className="text-sm text-violet-300">モード選択へ</Link></div><p className="mt-8 text-sm font-medium text-amber-300">{labels[mode]} MODE</p><h1 className="mt-2 text-3xl font-bold text-white">いまの予定を教えて</h1><p className="mt-3 mb-8 text-slate-300">移動できる範囲から、AIが候補をしぼり込みます。</p><QuestionFlow mode={mode} /></section></main>;
}
