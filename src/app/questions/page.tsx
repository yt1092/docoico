import React from 'react';
import QuestionFlow from '../../components/QuestionFlow';

export default function QuestionsPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">質問に答えてください</h2>
        <p className="text-gray-400 mb-6">あなたの希望に合わせてAIがおすすめスポットを提案します。</p>
        <QuestionFlow />
      </section>
    </main>
  );
}
