'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import ModeCard from '../../components/ModeCard';

type Favorite = { id?: string; name?: string; category?: string; comfort_score?: number };
type Profile = { display_name?: string; avatar_url?: string | null; birth_date?: string | null; partner_user_id?: string | null };
type History = { id: string; spot_name?: string; spot_category?: string; lat?: number; lng?: number; transport?: string; created_at: string };
type CoupleRecommendation = { id: string; spot_name: string; spot_category?: string; spot_reason?: string; sender?: { display_name?: string } | null };

export default function MyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'dashboard' | 'settings'>(searchParams.get('setup') ? 'settings' : 'dashboard');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [partner, setPartner] = useState<{ display_name?: string } | null>(null);
  const [recommendations, setRecommendations] = useState<CoupleRecommendation[]>([]);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(searchParams.get('setup') === 'couple' ? 'カップルモードを使うには、恋人のメールアドレスを登録してください。' : '');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const displayName = profile.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'ゲスト';
  const initials = displayName.charAt(0).toUpperCase();
  const age = useMemo(() => {
    if (!profile.birth_date) return null;
    const born = new Date(profile.birth_date); const today = new Date();
    return today.getFullYear() - born.getFullYear() - (today < new Date(today.getFullYear(), born.getMonth(), born.getDate()) ? 1 : 0);
  }, [profile.birth_date]);
  const tasks = [
    !profile.display_name && { title: '表示名を登録してください', detail: '例：山田', action: 'settings' as const },
    !profile.birth_date && { title: '年齢設定をしてください', detail: '年齢に合わせて候補を安全に提案します。', action: 'settings' as const },
    !partner && { title: '恋人のメールアドレスを登録してください', detail: '登録するとカップルモードが使え、提案も共有できます。', action: 'settings' as const }
  ].filter(Boolean) as { title: string; detail: string; action: 'settings' }[];

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [favRes, historyRes, profileRes, recRes] = await Promise.all([fetch('/api/favorites', { headers }), fetch('/api/history', { headers }), fetch('/api/profile', { headers }), fetch('/api/couple/recommendations', { headers })]);
      const [fav, hist, prof, rec] = await Promise.all([favRes.json(), historyRes.json(), profileRes.json(), recRes.json()]);
      setFavorites((fav.favorites || []).map((item: any) => ({ id: item.id, name: item.spots?.name, category: item.spots?.category, comfort_score: item.spots?.comfort_score })));
      setHistory(hist.history || []);
      if (prof.ok) { setProfile(prof.profile || {}); setPartner(prof.partner || null); }
      if (rec.ok) setRecommendations(rec.recommendations || []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function headers() { const { data: { session } } = await supabase.auth.getSession(); return session ? { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' } : null; }
  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); const auth = await headers(); if (!auth) return;
    const response = await fetch('/api/profile', { method: 'PATCH', headers: auth, body: JSON.stringify({ ...profile, partner_email: partnerEmail }) }); const data = await response.json();
    if (!response.ok) return setMessage(data.error || '設定を保存できませんでした。');
    setProfile(data.profile); setMessage('設定を保存しました。');
    const refresh = await fetch('/api/profile', { headers: auth }); const refreshed = await refresh.json(); if (refreshed.ok) setPartner(refreshed.partner || null);
  }
  async function uploadAvatar(file?: File) {
    if (!file) return; setUploading(true); setMessage(''); const auth = await headers(); if (!auth) return;
    const form = new FormData(); form.append('file', file);
    const response = await fetch('/api/profile/avatar', { method: 'POST', headers: { Authorization: auth.Authorization }, body: form }); const data = await response.json();
    if (response.ok) { setProfile(value => ({ ...value, avatar_url: data.avatar_url })); setMessage('プロフィール画像を更新しました。'); } else setMessage(data.error || '画像をアップロードできませんでした。');
    setUploading(false);
  }
  async function changePassword(event: React.FormEvent) { event.preventDefault(); if (password.length < 6) return setMessage('パスワードは6文字以上で設定してください。'); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? error.message : 'パスワードを変更しました。'); if (!error) setPassword(''); }
  async function removeFavorite(favorite: Favorite, index: number) { const auth = await headers(); if (auth && favorite.id) await fetch(`/api/favorites?id=${favorite.id}`, { method: 'DELETE', headers: auth }); setFavorites(items => items.filter((_, i) => i !== index)); }
  async function signOut() { await supabase.auth.signOut(); router.push('/login'); }
  const historyHref = (item: History) => `/map?${new URLSearchParams({ name: item.spot_name || 'スポット', lat: String(item.lat || ''), lng: String(item.lng || ''), category: item.spot_category || '', transport: item.transport || '徒歩' })}`;

  if (!user) return <main className="min-h-screen p-6"><section className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-bold">マイページ</h1><p className="mt-3 text-slate-600">設定と履歴を使うにはログインしてください。</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white">ログインする</Link></section></main>;

  return <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-amber-50 p-4 sm:p-6"><section className="mx-auto max-w-5xl">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[.2em] text-violet-600">DOCOICO DASHBOARD</p><h1 className="text-3xl font-bold">マイページ</h1></div><div className="flex gap-3"><Link href="/" className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm">トップへ</Link><button onClick={signOut} className="text-sm text-slate-500">ログアウト</button></div></header>
    <section className="mt-6 rounded-3xl bg-slate-900 p-6 text-white"><div className="flex flex-wrap items-center gap-4">{profile.avatar_url ? <img src={profile.avatar_url} alt="プロフィール画像" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-500 text-2xl font-bold">{initials}</div>}<div className="flex-1"><h2 className="text-2xl font-bold">{displayName}さん、今日はどこいこ？</h2><p className="mt-1 text-sm text-slate-300">{age ? `${age}歳・` : ''}{partner ? `${partner.display_name || '恋人'}さんと連携中` : '恋人を設定するとカップルモードを利用できます'}</p></div><button onClick={() => setTab('settings')} className="rounded-xl bg-white/10 px-4 py-3 text-sm">設定する</button></div></section>
    <nav className="mt-6 flex gap-2 rounded-xl bg-white p-1 shadow-sm"><button onClick={() => setTab('dashboard')} className={`flex-1 rounded-lg py-3 font-semibold ${tab === 'dashboard' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}>ダッシュボード</button><button onClick={() => setTab('settings')} className={`flex-1 rounded-lg py-3 font-semibold ${tab === 'settings' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}>設定</button></nav>
    {message && <p className="mt-4 rounded-xl bg-amber-100 p-3 text-sm text-amber-900">{message}</p>}
    {loading ? <p className="py-12 text-center">読み込み中…</p> : tab === 'dashboard' ? <div className="mt-6 space-y-6">
      {tasks.length > 0 && <section><h2 className="mb-3 text-xl font-bold">やること</h2><div className="grid gap-3 sm:grid-cols-3">{tasks.map(task => <button key={task.title} onClick={() => setTab(task.action)} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left"><p className="font-semibold">{task.title}</p><p className="mt-1 text-sm text-slate-600">{task.detail}</p><p className="mt-3 text-sm text-violet-700">設定を開く →</p></button>)}</div></section>}
      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">お気に入り</p><p className="mt-2 text-3xl font-bold">{favorites.length}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">閲覧履歴</p><p className="mt-2 text-3xl font-bold">{history.length}/3</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">恋人からの提案</p><p className="mt-2 text-3xl font-bold">{recommendations.length}</p></div></div>
      <section><h2 className="mb-3 text-xl font-bold">いまの気分で探す</h2><div className="grid gap-3 sm:grid-cols-3"><ModeCard emoji="👫" title="カップルモード" mode="couple" /><ModeCard emoji="👥" title="フレンズモード" mode="friends" /><ModeCard emoji="🚶" title="ソロモード" mode="solo" /></div></section>
      <section className="rounded-2xl bg-rose-50 p-5"><h2 className="text-xl font-bold">恋人から届いた提案</h2>{recommendations.length ? recommendations.map(item => <div key={item.id} className="mt-3 rounded-xl bg-white p-4"><p className="font-semibold">{item.sender?.display_name || '恋人'}さんから「{item.spot_name}」を提案されています。</p><p className="text-sm text-slate-600">{item.spot_category} {item.spot_reason ? `・${item.spot_reason}` : ''}</p></div>) : <p className="mt-2 text-sm text-slate-600">まだ提案はありません。</p>}</section>
      <section><h2 className="mb-3 text-xl font-bold">閲覧履歴（最新3件）</h2>{history.length ? <div className="grid gap-3 sm:grid-cols-3">{history.map(item => <Link key={item.id} href={historyHref(item)} className="rounded-2xl bg-white p-4 shadow-sm"><p className="font-semibold">{item.spot_name || 'スポット'}</p><p className="mt-1 text-sm text-violet-600">{item.spot_category}・{item.transport || '徒歩'}</p><p className="mt-3 text-sm text-slate-500">地図とルートを開く →</p></Link>)}</div> : <div className="rounded-2xl bg-white p-5 text-sm text-slate-500">質問後に候補を選ぶと、ここからすぐ地図とルートを開けます。</div>}</section>
      <section><h2 className="mb-3 text-xl font-bold">お気に入りスポット</h2>{favorites.length ? <div className="grid gap-3 sm:grid-cols-2">{favorites.map((favorite, i) => <div key={favorite.id || i} className="flex justify-between rounded-2xl bg-white p-4 shadow-sm"><div><p className="font-semibold">{favorite.name}</p><p className="text-sm text-violet-600">{favorite.category}</p></div><button onClick={() => removeFavorite(favorite, i)} className="text-sm text-slate-400">削除</button></div>)}</div> : <p className="rounded-xl bg-white p-4 text-sm text-slate-500">まだありません。</p>}</section>
    </div> : <div className="mt-6 grid gap-6 lg:grid-cols-2"><form onSubmit={saveProfile} className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">プロフィールとカップル設定</h2><label className="mt-5 block text-sm font-medium">表示名<input value={profile.display_name || ''} onChange={e => setProfile(v => ({ ...v, display_name: e.target.value }))} className="mt-1 w-full rounded-xl border p-3" placeholder="例：山田" /></label><label className="mt-4 block text-sm font-medium">プロフィール画像<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => uploadAvatar(e.target.files?.[0])} className="mt-1 block w-full text-sm" /></label><p className="mt-1 text-xs text-slate-500">写真フォルダから選択できます（PNG/JPEG/WebP、3MB以下）。{uploading ? 'アップロード中…' : ''}</p><label className="mt-4 block text-sm font-medium">生年月日<input type="date" value={profile.birth_date || ''} onChange={e => setProfile(v => ({ ...v, birth_date: e.target.value }))} className="mt-1 w-full rounded-xl border p-3" /></label><label className="mt-4 block text-sm font-medium">恋人のログイン用メールアドレス<input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} className="mt-1 w-full rounded-xl border p-3" placeholder={partner ? `${partner.display_name || '登録済み'}（変更する場合だけ入力）` : 'partner@example.com'} /></label><p className="mt-2 text-xs text-slate-500">相手が一度ログインしてから入力してください。空欄で保存すると連携を解除します。</p><button className="mt-5 w-full rounded-xl bg-violet-600 py-3 font-semibold text-white">設定を保存</button></form><form onSubmit={changePassword} className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">セキュリティ</h2><label className="mt-5 block text-sm font-medium">新しいパスワード<input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border p-3" placeholder="6文字以上" /></label><button className="mt-5 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white">パスワードを変更</button></form></div>}
  </section></main>;
}
