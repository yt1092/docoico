'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import ModeCard from '../../components/ModeCard';

type Favorite = { id?: string; name?: string; category?: string; comfort_score?: number };
type Profile = { display_name?: string; avatar_url?: string | null; birth_date?: string | null; partner_user_id?: string | null };
type CoupleRecommendation = { id: string; spot_name: string; spot_category?: string; spot_reason?: string; created_at: string; sender?: { display_name?: string; avatar_url?: string | null } | null };

export default function MyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [partner, setPartner] = useState<{ display_name?: string; avatar_url?: string | null } | null>(null);
  const [recommendations, setRecommendations] = useState<CoupleRecommendation[]>([]);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const displayName = profile.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'ゲスト';
  const initials = displayName.charAt(0).toUpperCase();
  const age = useMemo(() => {
    if (!profile.birth_date) return null;
    const born = new Date(profile.birth_date);
    const today = new Date();
    return today.getFullYear() - born.getFullYear() - (today < new Date(today.getFullYear(), born.getMonth(), born.getDate()) ? 1 : 0);
  }, [profile.birth_date]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!user) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [favRes, histRes, profileRes, recRes] = await Promise.all([
        fetch('/api/favorites', { headers }), fetch('/api/history', { headers }), fetch('/api/profile', { headers }), fetch('/api/couple/recommendations', { headers })
      ]);
      const [favJson, histJson, profileJson, recJson] = await Promise.all([favRes.json(), histRes.json(), profileRes.json(), recRes.json()]);
      setFavorites((favJson.favorites || []).map((favorite: any) => ({ id: favorite.id, name: favorite.spots?.name, category: favorite.spots?.category, comfort_score: favorite.spots?.comfort_score })));
      setHistory(histJson.history || []);
      if (profileJson.ok) { setProfile(profileJson.profile || {}); setPartner(profileJson.partner || null); }
      if (recJson.ok) setRecommendations(recJson.recommendations || []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function sessionHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' } : null;
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setMessage('');
    const headers = await sessionHeaders();
    if (!headers) return;
    const response = await fetch('/api/profile', { method: 'PATCH', headers, body: JSON.stringify({ ...profile, partner_email: partnerEmail }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || '設定を保存できませんでした。');
    setProfile(data.profile); setMessage('設定を保存しました。恋人を登録した場合、相手のマイページにあなたの提案が届きます。');
    const refreshed = await fetch('/api/profile', { headers });
    const refreshedJson = await refreshed.json();
    if (refreshedJson.ok) setPartner(refreshedJson.partner || null);
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault(); setMessage('');
    if (password.length < 6) return setMessage('パスワードは6文字以上で設定してください。');
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? error.message : 'パスワードを変更しました。');
    if (!error) setPassword('');
  }

  async function removeFavorite(favorite: Favorite, index: number) {
    const headers = await sessionHeaders();
    if (headers && favorite.id) await fetch(`/api/favorites?id=${favorite.id}`, { method: 'DELETE', headers });
    setFavorites(previous => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSignOut() { await supabase.auth.signOut(); router.push('/login'); }

  if (!user) return <main className="min-h-screen p-6"><section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-bold">マイページ</h1><p className="mt-3 text-slate-600">設定・履歴・カップル連携にはログインが必要です。</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white">ログインする</Link></section></main>;

  return <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-amber-50 p-4 sm:p-6"><section className="mx-auto max-w-5xl">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[.2em] text-violet-600">DOCOICO DASHBOARD</p><h1 className="text-3xl font-bold text-slate-900">マイページ</h1></div><div className="flex gap-3"><Link href="/" className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm">トップへ</Link><button onClick={handleSignOut} className="rounded-lg px-4 py-2 text-sm text-slate-500">ログアウト</button></div></header>
    <section className="mt-6 rounded-3xl bg-slate-900 p-6 text-white shadow-lg"><div className="flex flex-wrap items-center gap-4">{profile.avatar_url ? <img src={profile.avatar_url} alt="プロフィール画像" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-500 text-2xl font-bold">{initials}</div>}<div className="flex-1"><h2 className="text-2xl font-bold">{displayName}さん、今日はどこいこ？</h2><p className="mt-1 text-sm text-slate-300">{age ? `${age}歳・` : ''}{partner ? `${partner.display_name || '恋人'}さんと連携中` : '恋人を設定するとカップル提案を共有できます'}</p></div><button onClick={() => setTab('settings')} className="rounded-xl bg-white/10 px-4 py-3 text-sm hover:bg-white/20">プロフィール設定</button></div></section>
    <nav className="mt-6 flex gap-2 rounded-xl bg-white p-1 shadow-sm"><button onClick={() => setTab('dashboard')} className={`flex-1 rounded-lg py-3 text-sm font-semibold ${tab === 'dashboard' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}>ダッシュボード</button><button onClick={() => setTab('settings')} className={`flex-1 rounded-lg py-3 text-sm font-semibold ${tab === 'settings' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}>設定</button></nav>
    {message && <p className="mt-4 rounded-xl bg-violet-100 p-3 text-sm text-violet-800">{message}</p>}
    {loading ? <p className="py-12 text-center text-slate-500">読み込み中…</p> : tab === 'dashboard' ? <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">お気に入り</p><p className="mt-2 text-3xl font-bold">{favorites.length}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">訪問履歴</p><p className="mt-2 text-3xl font-bold">{history.length}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">恋人からの提案</p><p className="mt-2 text-3xl font-bold">{recommendations.length}</p></div></div>
      <section><div className="mb-3 flex justify-between"><h2 className="text-xl font-bold">いまの気分で探す</h2><Link href="/questions" className="text-sm text-violet-600">質問から探す</Link></div><div className="grid gap-3 sm:grid-cols-3"><ModeCard emoji="👫" title="カップルモード" /><ModeCard emoji="👥" title="フレンズモード" /><ModeCard emoji="🚶" title="ソロモード" /></div></section>
      <section className="rounded-2xl border border-rose-100 bg-rose-50 p-5"><h2 className="text-xl font-bold text-rose-900">恋人から届いた提案</h2>{recommendations.length ? <div className="mt-3 space-y-3">{recommendations.map(item => <div key={item.id} className="rounded-xl bg-white p-4"><p className="font-semibold">{item.sender?.display_name || '恋人'}さんから「{item.spot_name}」を提案されています。</p><p className="mt-1 text-sm text-slate-600">{item.spot_category} {item.spot_reason ? `・${item.spot_reason}` : ''}</p></div>)}</div> : <p className="mt-2 text-sm text-rose-800">まだ提案はありません。カップルモードで候補を開くと、登録した恋人へ共有できます。</p>}</section>
      <section><h2 className="mb-3 text-xl font-bold">お気に入りスポット</h2>{favorites.length ? <div className="grid gap-3 sm:grid-cols-2">{favorites.map((favorite, index) => <div key={favorite.id || index} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"><div><p className="font-semibold">{favorite.name}</p><p className="text-sm text-violet-600">{favorite.category}</p></div><button onClick={() => removeFavorite(favorite, index)} className="text-sm text-slate-400">削除</button></div>)}</div> : <div className="rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">地図でスポットを開いて「お気に入り」を押すとここに保存されます。</div>}</section>
    </div> : <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveProfile} className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">プロフィールとカップル設定</h2><label className="mt-5 block text-sm font-medium">表示名<input value={profile.display_name || ''} onChange={e => setProfile(value => ({ ...value, display_name: e.target.value }))} className="mt-1 w-full rounded-xl border p-3" placeholder="例：ゆうと" /></label><label className="mt-4 block text-sm font-medium">アイコン画像URL<input value={profile.avatar_url || ''} onChange={e => setProfile(value => ({ ...value, avatar_url: e.target.value }))} className="mt-1 w-full rounded-xl border p-3" placeholder="https://..." /></label><label className="mt-4 block text-sm font-medium">生年月日<input type="date" value={profile.birth_date || ''} onChange={e => setProfile(value => ({ ...value, birth_date: e.target.value }))} className="mt-1 w-full rounded-xl border p-3" /></label><label className="mt-4 block text-sm font-medium">恋人のログイン用メールアドレス<input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} className="mt-1 w-full rounded-xl border p-3" placeholder={partner ? `${partner.display_name || '登録済み'}（変更する場合だけ入力）` : 'partner@example.com'} /></label><p className="mt-2 text-xs text-slate-500">相手が一度DOCOICOへログインしてから登録してください。空欄で保存すると連携を解除します。</p><button className="mt-5 w-full rounded-xl bg-violet-600 py-3 font-semibold text-white">設定を保存</button></form><form onSubmit={changePassword} className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">セキュリティ</h2><p className="mt-2 text-sm text-slate-500">メールアドレスでログインしているアカウントのパスワードを変更できます。</p><label className="mt-5 block text-sm font-medium">新しいパスワード<input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border p-3" placeholder="6文字以上" /></label><button className="mt-5 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white">パスワードを変更</button><div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><strong>おすすめの使い方</strong><br />カップルの両方を <code>DEMO_ALLOWED_EMAIL</code> に追加すると、二人とも提案・地図・ルート案内を使えます。</div></form></div>}
  </section></main>;
}
