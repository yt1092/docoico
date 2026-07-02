import React from 'react';
import Link from 'next/link';

type Props = { params: { mode: string } };

export default function ModePage({ params }: Props) {
  const mode = params.mode;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-4">{mode} を選択しました</h2>
        <p className="text-gray-300 mb-6">質問に答えて、AIに最適なスポットを提案してもらいましょう。</p>
        <div className="flex justify-center gap-4">
          <Link href={`/questions?mode=${mode}`} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg font-semibold">
            質問を開始
          </Link>
          <Link href="/" className="px-6 py-3 border rounded-lg">戻る</Link>
        </div>
      </section>
    </main>
  );
}
