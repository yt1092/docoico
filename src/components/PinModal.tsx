'use client';
import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { supabase } from '../lib/supabaseClient';
import { demoAuthHeaders } from '../lib/clientAuth';
import DirectionsPanel from './DirectionsPanel';

export default function PinModal({
  spot,
  origin,
  initialMode,
  onClose,
  onRoute
}: {
  spot: any;
  origin?: { lat: number; lng: number } | null;
  initialMode?: 'walking' | 'driving' | 'transit';
  onClose: () => void;
  onRoute?: (path: { lat: number; lng: number }[]) => void;
}) {
  const [social, setSocial] = useState<any>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [favoriteState, setFavoriteState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const el = document.getElementById('pin-modal');
    if (el) gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    // Try Instagram-specific endpoint first
    const igUrl = spot.instagram_url || '';
    async function loadSocial() {
      const headers = await demoAuthHeaders();
      const socialUrl = `/api/social?q=${encodeURIComponent(spot.name)}`;
      if (!igUrl) return fetch(socialUrl, { headers }).then(r => r.json()).then(setSocial);
      const instagram = await fetch(`/api/instagram?url=${encodeURIComponent(igUrl)}`, { headers }).then(r => r.json());
      if (instagram?.ok && instagram?.items?.length) setSocial({ instagram: instagram.items });
      else fetch(socialUrl, { headers }).then(r => r.json()).then(setSocial);
    }
    loadSocial().catch(() => {});
  }, [spot]);

  async function saveFavorite() {
    setFavoriteState('saving');
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const raw = localStorage.getItem('docoico_guest_favorites');
        const list = raw ? JSON.parse(raw) : [];
        const key = spot.google_place_id || `${spot.name}@${spot.lat},${spot.lng}`;
        if (!list.some((f: any) => (f.google_place_id || `${f.name}@${f.lat},${f.lng}`) === key)) {
          list.push({ name: spot.name, category: spot.category, lat: spot.lat, lng: spot.lng, google_place_id: spot.google_place_id, comfort_score: spot.comfort_score });
          localStorage.setItem('docoico_guest_favorites', JSON.stringify(list));
        }
        setFavoriteState('saved');
        return;
      }

      let spotId = spot.id;
      if (!spotId) {
        const upsertRes = await fetch('/api/spots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: spot.name, category: spot.category, lat: spot.lat, lng: spot.lng, google_place_id: spot.google_place_id, comfort_score: spot.comfort_score })
        });
        const upsertJson = await upsertRes.json();
        if (!upsertJson.ok) throw new Error(upsertJson.error || 'spot upsert failed');
        spotId = upsertJson.spot.id;
      }

      const favRes = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ spot_id: spotId })
      });
      const favJson = await favRes.json();
      if (!favJson.ok) throw new Error(favJson.error || 'favorite failed');
      setFavoriteState('saved');
    } catch (e) {
      console.warn('Failed to save favorite', e);
      setFavoriteState('error');
    }
  }

  const destination = spot.lat != null && spot.lng != null ? `${spot.lat},${spot.lng}` : undefined;
  const originStr = origin ? `${origin.lat},${origin.lng}` : undefined;

  return (
    <div id="pin-modal" className="absolute left-2 right-2 top-4 sm:left-4 sm:right-auto bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-auto sm:w-80 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{spot.name}</h3>
          <div className="text-sm text-gray-400">{spot.category} • 快適度: {spot.comfort_score ?? '—'}</div>
        </div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">閉じる</button>
      </div>
      {spot.instagram_url && (
        <div className="mt-3 text-sm text-gray-500">Instagram: <a href={spot.instagram_url} target="_blank" rel="noreferrer" className="text-amber-600">リンク</a></div>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={saveFavorite}
          disabled={favoriteState === 'saving' || favoriteState === 'saved'}
          className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-60"
        >
          {favoriteState === 'saved' ? '保存済み' : favoriteState === 'saving' ? '保存中…' : 'お気に入り'}
        </button>
        <button
          onClick={() => setShowDirections(v => !v)}
          disabled={!destination}
          className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-60"
        >
          ルート案内
        </button>
      </div>
      {favoriteState === 'error' && <div className="mt-2 text-xs text-red-500">保存に失敗しました</div>}

      {showDirections && destination && (
        <div className="mt-3">
          <DirectionsPanel origin={originStr} destination={destination} initialMode={initialMode} onRoute={onRoute} />
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">SNS 情報:
        {Array.isArray(social?.instagram) && social.instagram.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {social.instagram.map((it: any) => (
              <a key={it.id} href={it.permalink} target="_blank" rel="noreferrer">
                <img src={it.media_url} className="w-full h-20 object-cover rounded-lg" alt="" />
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-gray-400">SNS情報は未設定です</div>
        )}
      </div>
    </div>
  );
}
