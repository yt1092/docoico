'use client';
import React from 'react';
import Link from 'next/link';
import QRScanner from '../../components/QRScanner';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <section className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">QRをスキャンして参加</h2>
          <Link href="/mypage" className="text-sm text-violet-600 hover:text-violet-700 font-medium">マイページへ戻る</Link>
        </div>
        <QRScanner
          onDetected={(data) => {
            try {
              const url = new URL(data);
              router.push(url.pathname + url.search);
            } catch (e) {
              // not a full URL, try as session id
              router.push(`/session/${encodeURIComponent(data)}`);
            }
          }}
        />
      </section>
    </main>
  );
}
