'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { createGuestLocalProfile } from '../lib/auth';

export default function AuthButtons() {
  const router = useRouter();

  const signInGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/mypage` } });
    } catch (err) {
      console.error(err);
    }
  };

  const signInLine = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'line' as any, options: { redirectTo: `${window.location.origin}/mypage` } });
    } catch (err) {
      console.error(err);
    }
  };

  const guest = () => {
    createGuestLocalProfile();
    router.push('/mypage');
  };

  return (
    <div className="flex flex-col gap-2">
      <button onClick={signInGoogle} className="w-full px-3 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Googleでログイン</button>
      <button onClick={signInLine} className="w-full px-3 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">LINEでログイン</button>
      <button onClick={guest} className="w-full px-3 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">ゲストで利用する</button>
    </div>
  );
}
