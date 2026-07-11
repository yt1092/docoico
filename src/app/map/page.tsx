import React, { Suspense } from 'react';
import Link from 'next/link';
import MapView from '../../components/MapView';

export default function MapPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6">
      <section className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">地図でスポットを探す</h2>
          <Link href="/mypage" className="text-sm text-violet-600 hover:text-violet-700 font-medium">マイページへ戻る</Link>
        </div>
        <Suspense fallback={<div className="text-gray-400 text-center py-12">読み込み中…</div>}>
          <MapView />
        </Suspense>
      </section>
    </main>
  );
}
