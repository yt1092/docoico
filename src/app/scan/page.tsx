'use client';
import React from 'react';
import QRScanner from '../../components/QRScanner';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">QRをスキャンして参加</h2>
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
