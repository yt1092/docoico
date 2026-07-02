'use client';
import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function PinModal({ spot, onClose }: { spot: any; onClose: () => void }) {
  const [social, setSocial] = useState<any>(null);

  useEffect(() => {
    const el = document.getElementById('pin-modal');
    if (el) gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    // Try Instagram-specific endpoint first
    const igUrl = spot.instagram_url || '';
    if (igUrl) {
      fetch(`/api/instagram?url=${encodeURIComponent(igUrl)}`).then(r => r.json()).then((json) => {
        if (json?.ok && json?.items?.length) setSocial({ instagram: json.items });
        else fetch(`/api/social?q=${encodeURIComponent(spot.name)}`).then(r => r.json()).then(setSocial).catch(() => {});
      }).catch(() => {
        fetch(`/api/social?q=${encodeURIComponent(spot.name)}`).then(r => r.json()).then(setSocial).catch(() => {});
      });
    } else {
      fetch(`/api/social?q=${encodeURIComponent(spot.name)}`).then(r => r.json()).then(setSocial).catch(() => {});
    }
  }, [spot]);

  return (
    <div id="pin-modal" className="absolute left-4 top-4 bg-[#0f1113] p-4 rounded shadow-lg w-80">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">{spot.name}</h3>
          <div className="text-sm text-gray-400">{spot.category} • 快適度: {spot.comfort_score ?? '—'}</div>
        </div>
        <button onClick={onClose} className="text-xs text-gray-300">閉じる</button>
      </div>
      <div className="mt-3 text-sm text-gray-300">Instagram: <a href={spot.instagram_url ?? '#'} target="_blank" rel="noreferrer" className="text-yellow-300">リンク</a></div>
      <div className="mt-3">
        <button className="px-3 py-2 bg-purple-600 rounded mr-2">お気に入り</button>
        <button className="px-3 py-2 bg-indigo-600 rounded">ルート案内</button>
      </div>
      <div className="mt-3 text-xs text-gray-400">SNS 情報:
        {social?.instagram ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {social.instagram.map((it: any) => (
              <a key={it.id} href={it.permalink} target="_blank" rel="noreferrer">
                <img src={it.media_url} className="w-full h-20 object-cover rounded" />
              </a>
            ))}
          </div>
        ) : (
          <pre className="text-xs max-h-32 overflow-auto bg-[#0b0b0d] p-2 rounded mt-2">{JSON.stringify(social, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
