'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import ModeCard from '../../components/ModeCard';

type Favorite = { id?: string; name?: string; category?: string; comfort_score?: number };

export default function MyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [guestProfile, setGuestProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('docoico_guest');
      if (raw) setGuestProfile(JSON.parse(raw));
    } catch {
      // localStorage not available
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const [favRes, histRes] = await Promise.all([
            fetch('/api/favorites', { headers: { Authorization: `Bearer ${session.access_token}` } }),
            fetch('/api/history', { headers: { Authorization: `Bearer ${session.access_token}` } })
          ]);
          const favJson = await favRes.json();
          const histJson = await histRes.json();
          setFavorites((favJson.favorites || []).map((f: any) => ({ id: f.id, name: f.spots?.name, category: f.spots?.category, comfort_score: f.spots?.comfort_score })));
          setHistory(histJson.history || []);
        }
      } else {
        try {
          const raw = localStorage.getItem('docoico_guest_favorites');
          setFavorites(raw ? JSON.parse(raw) : []);
        } catch {
          setFavorites([]);
        }
        setHistory([]);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function removeFavorite(fav: Favorite, index: number) {
    if (user && fav.id) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch(`/api/favorites?id=${fav.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } });
      }
    } else {
      const next = favorites.filter((_, i) => i !== index);
      localStorage.setItem('docoico_guest_favorites', JSON.stringify(next));
    }
    setFavorites(prev => prev.filter((_, i) => i !== index));
  }

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || guestProfile?.display_name;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <section className="max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">マイページ</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">トップへ戻る</Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} className="w-12 h-12 rounded-full flex-shrink-0" alt="avatar" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold flex-shrink-0">
              {(displayName || 'G')[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 truncate">{displayName || 'ゲストさん'}</div>
            <div className="text-xs text-gray-400">{user ? 'ログイン中' : 'ゲストとして利用中'}</div>
          </div>
          {user ? (
            <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-red-500 flex-shrink-0">ログアウト</button>
          ) : (
            <Link href="/login" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex-shrink-0">ログイン</Link>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-3">今の気分で探す</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <ModeCard emoji="👫" title="カップルモード" />
          <ModeCard emoji="👥" title="フレンズモード" />
          <ModeCard emoji="🚶" title="ソロモード" />
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-3">お気に入りスポット</h3>
        {loading ? (
          <div className="text-gray-400 text-sm mb-6">読み込み中…</div>
        ) : favorites.length ? (
          <div className="grid grid-cols-1 gap-3 mb-6">
            {favorites.map((f, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{f.name}</div>
                  <div className="text-sm text-violet-600">{f.category}</div>
                </div>
                <button onClick={() => removeFavorite(f, i)} className="text-xs text-gray-400 hover:text-red-500">削除</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm mb-6">
            まだお気に入りがありません。地図でスポットを開いて「お気に入り」を押すと、ここに追加されます。
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-700 mb-3">訪問履歴</h3>
        {user ? (
          history.length ? (
            <div className="grid grid-cols-1 gap-3">
              {history.map((h, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-sm text-gray-500">{new Date(h.created_at).toLocaleString('ja-JP')}</div>
                  {h.note && <div className="text-sm text-gray-700 mt-1">{h.note}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm">まだ履歴がありません。</div>
          )
        ) : (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
            ログインすると訪問履歴が記録されます。
          </div>
        )}
      </section>
    </main>
  );
}
