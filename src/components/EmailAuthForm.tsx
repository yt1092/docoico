'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function EmailAuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setMessage('確認メールを送信しました。メール内のリンクを開いて登録を完了してください。');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/mypage');
      }
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex mb-4 rounded-lg bg-gray-50 p-1">
        <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'login' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500'}`}>
          ログイン
        </button>
        <button type="button" onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'signup' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500'}`}>
          新規登録
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-violet-400 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">パスワード</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-violet-400 focus:outline-none pr-10"
              placeholder="6文字以上"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">パスワード（確認）</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-violet-400 focus:outline-none"
              placeholder="もう一度入力"
            />
          </div>
        )}

        {error && <div className="text-sm text-red-500">{error}</div>}
        {message && <div className="text-sm text-green-600">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-amber-500 text-white rounded-lg font-semibold hover:shadow-md transition disabled:opacity-60"
        >
          {loading ? '処理中…' : mode === 'signup' ? '登録する' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}
