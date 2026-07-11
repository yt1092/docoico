import React from 'react';
import Link from 'next/link';

type Props = { params: { mode: string } };

export default function ModePage({ params }: Props) {
  const mode = decodeURIComponent(params.mode);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <section className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">{mode} を選択しました</h2>
        <p className="text-gray-500 mb-6">質問に答えて、AIに最適なスポットを提案してもらいましょう。</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={`/questions?mode=${mode}`} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-amber-500 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition">
            質問を開始
          </Link>
          <Link href="/mypage" className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">マイページへ戻る</Link>
        </div>
      </section>
    </main>
  );
}
