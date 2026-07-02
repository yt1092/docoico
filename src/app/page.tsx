import React from 'react';
import ModeCard from '../components/ModeCard';
import AuthButtons from '../components/AuthButtons';
import AuthProvider from '../components/AuthProvider';
import LLMTester from '../components/LLMTester';

export default function Page() {
  return (
    <AuthProvider>
      <main className="min-h-screen flex items-center justify-center p-6">
        <section className="w-full max-w-3xl">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">DOCOICO — どこいこ</h1>
              <p className="text-gray-300">リアルタイムで今行くべきスポットをAIが提案します。</p>
            </div>
            <div className="flex items-center gap-3">
              <LLMTester />
              <AuthButtons />
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ModeCard emoji="👫" title="カップルモード" />
            <ModeCard emoji="👥" title="フレンズモード" />
            <ModeCard emoji="🚶" title="ソロモード" />
          </div>
        </section>
      </main>
    </AuthProvider>
  );
}
