'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import LottieLoader from './LottieLoader';
import celebrateAnim from '../public/celebrate.json';

export default function ResultModal({ result, onClose }: { result: any; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div ref={ref} className="bg-white p-6 rounded-xl shadow-xl z-10 w-full max-w-2xl border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">おすすめスポット</h3>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">閉じる</button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {result?.spots?.map((s: any, i: number) => (
            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-lg font-semibold text-gray-800">{s.name}</div>
              <div className="text-sm text-violet-600">{s.category}</div>
              <div className="text-sm mt-2 text-gray-500">{s.reason}</div>
              <div className="mt-2 text-xs text-amber-600">快適度: {s.comfort_score}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center">
          <LottieLoader animationData={celebrateAnim} />
        </div>
      </div>
    </div>
  );
}
