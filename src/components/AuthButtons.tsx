'use client';
import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { createGuestLocalProfile } from '../lib/auth';

export default function AuthButtons() {
  const signInGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
    } catch (err) {
      console.error(err);
    }
  };

  const signInLine = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'line' as any, options: { redirectTo: window.location.href } });
    } catch (err) {
      console.error(err);
    }
  };

  const guest = () => {
    const profile = createGuestLocalProfile();
    alert(`ゲストとして参加: ${profile.id}`);
  };

  return (
    <div className="flex gap-2">
      <button onClick={signInGoogle} className="px-3 py-2 bg-blue-600 rounded">Googleでログイン</button>
      <button onClick={signInLine} className="px-3 py-2 bg-green-600 rounded">LINEでログイン</button>
      <button onClick={guest} className="px-3 py-2 bg-gray-600 rounded">ゲストで参加</button>
    </div>
  );
}
