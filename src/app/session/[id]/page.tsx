'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SessionJoin({ params }: { params: { id: string } }) {
  const sessionId = params.id;
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({ mood: '', atmosphere: '', genre: '', budget: '' });
  const router = useRouter();

  useEffect(() => {
    // nothing for now
  }, []);

  const handleChange = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    try {
      await supabase.from('votes').insert([{ session_id: sessionId, ...values }]);
      setSubmitted(true);
    } catch (e) {
      alert('送信エラー');
    }
  };

  if (submitted)
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">投票ありがとうございました！</h3>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 border rounded">トップへ戻る</button>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">セッションに参加 — 投票</h2>
        <div className="space-y-4">
          <div>
            <div className="mb-2">気分</div>
            <div className="flex gap-2">
              <button onClick={() => handleChange('mood', 'がっつり')} className="px-3 py-2 bg-gray-800 rounded">がっつり</button>
              <button onClick={() => handleChange('mood', 'ちょうどよく')} className="px-3 py-2 bg-gray-800 rounded">ちょうどよく</button>
              <button onClick={() => handleChange('mood', '軽く')} className="px-3 py-2 bg-gray-800 rounded">軽く</button>
            </div>
          </div>

          <div>
            <div className="mb-2">雰囲気</div>
            <div className="flex gap-2">
              <button onClick={() => handleChange('atmosphere', 'おしゃれ')} className="px-3 py-2 bg-gray-800 rounded">おしゃれ</button>
              <button onClick={() => handleChange('atmosphere', '落ち着いた')} className="px-3 py-2 bg-gray-800 rounded">落ち着いた</button>
              <button onClick={() => handleChange('atmosphere', '活気ある')} className="px-3 py-2 bg-gray-800 rounded">活気ある</button>
            </div>
          </div>

          <div>
            <div className="mb-2">ジャンル</div>
            <div className="flex gap-2">
              <button onClick={() => handleChange('genre', 'グルメ')} className="px-3 py-2 bg-gray-800 rounded">グルメ</button>
              <button onClick={() => handleChange('genre', 'カフェ')} className="px-3 py-2 bg-gray-800 rounded">カフェ</button>
              <button onClick={() => handleChange('genre', 'アミューズメント')} className="px-3 py-2 bg-gray-800 rounded">アミューズメント</button>
              <button onClick={() => handleChange('genre', 'ショッピング')} className="px-3 py-2 bg-gray-800 rounded">ショッピング</button>
            </div>
          </div>

          <div>
            <div className="mb-2">予算</div>
            <div className="flex gap-2">
              <button onClick={() => handleChange('budget', 'リーズナブル')} className="px-3 py-2 bg-gray-800 rounded">リーズナブル</button>
              <button onClick={() => handleChange('budget', 'ちょうどよく')} className="px-3 py-2 bg-gray-800 rounded">ちょうどよく</button>
              <button onClick={() => handleChange('budget', '奮発')} className="px-3 py-2 bg-gray-800 rounded">奮発</button>
            </div>
          </div>

          <div className="mt-4">
            <button onClick={submit} className="px-4 py-3 bg-yellow-500 rounded w-full">投票して参加</button>
          </div>
        </div>
      </section>
    </main>
  );
}
