'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import EmailAuthForm from '../../components/EmailAuthForm';
import AuthButtons from '../../components/AuthButtons';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/mypage');
  }, [user, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">DOCOICO</Link>
          <p className="text-gray-500 text-sm mt-1">ログインして、あなただけのスポット提案を受け取ろう</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <EmailAuthForm />

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs text-gray-400">または</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <AuthButtons />
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">トップへ戻る</Link>
        </div>
      </div>
    </main>
  );
}
