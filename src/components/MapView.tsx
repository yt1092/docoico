'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ThreeJsPinEffect from './ThreeJsPinEffect';
import PinModal from './PinModal';

declare global {
  interface Window { initMap?: any; }
}

let mapsLoader: Promise<void> | null = null;

function loadGoogleMaps(key: string) {
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsLoader) return mapsLoader;
  mapsLoader = new Promise((resolve, reject) => {
    const callback = '__docoicoGoogleMapsReady';
    (window as any)[callback] = () => resolve();
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${callback}`;
    script.async = true;
    script.onerror = () => reject(new Error('Google Maps を読み込めませんでした。APIキーの制限を確認してください。'));
    document.head.appendChild(script);
  });
  return mapsLoader;
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const routeLineRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const transport = searchParams.get('transport');
  const initialMode = transport === '電車' ? 'transit' : transport === 'バス' ? 'bus' : transport === '車' ? 'driving' : 'walking';

  function drawRoute(path: { lat: number; lng: number }[], color = '#7c3aed') {
    if (!map || !path.length) return;
    if (routeLineRef.current) routeLineRef.current.setMap(null);
    const line = new (window as any).google.maps.Polyline({
      path,
      strokeColor: color,
      strokeWeight: 5,
      strokeOpacity: 0.8
    });
    line.setMap(map);
    routeLineRef.current = line;

    const bounds = new (window as any).google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    map.fitBounds(bounds);
  }

  useEffect(() => {
    let cancelled = false;
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setMapError('Google Maps APIキーが設定されていません。');
      return;
    }

    async function init() {
      try {
        await loadGoogleMaps(key!);
        if (cancelled || !mapRef.current) return;
      } catch (error) {
        if (!cancelled) setMapError(error instanceof Error ? error.message : '地図を読み込めませんでした。');
        return;
      }
      const targetLat = searchParams.get('lat');
      const targetLng = searchParams.get('lng');
      const target = targetLat && targetLng ? { lat: parseFloat(targetLat), lng: parseFloat(targetLng) } : null;

      const mapObj = new (window as any).google.maps.Map(mapRef.current, {
        center: target || { lat: 35.68, lng: 139.76 },
        zoom: target ? 16 : 14,
        mapId: ''
      });
      setMap(mapObj);

      navigator.geolocation.getCurrentPosition(pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (!target) mapObj.setCenter(loc);
      }, () => {});

      // load spots
      const res = await fetch('/api/spots');
      const json = await res.json();
      const spots = json.spots || [];
      const createdMarkers: any[] = [];
      spots.forEach((s: any) => {
        const marker = new (window as any).google.maps.Marker({ position: { lat: s.lat, lng: s.lng }, map: mapObj, title: s.name });
        marker.addListener('click', () => setSelected(s));
        createdMarkers.push(marker);
      });

      if (target) {
        const targetSpot = {
          name: searchParams.get('name') || 'おすすめスポット',
          category: searchParams.get('category') || undefined,
          google_place_id: searchParams.get('place_id') || undefined,
          lat: target.lat,
          lng: target.lng
        };
        const targetMarker = new (window as any).google.maps.Marker({
          position: target,
          map: mapObj,
          title: targetSpot.name,
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });
        targetMarker.addListener('click', () => setSelected(targetSpot));
        createdMarkers.push(targetMarker);
        setSelected(targetSpot);
      }

      setMarkers(createdMarkers);
    }
    init();
    return () => { cancelled = true; };
  }, [searchParams]);

  return (
    <div className="relative h-[70vh] rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {mapError && <div className="absolute inset-0 grid place-items-center bg-white p-6 text-center text-red-600">{mapError}</div>}
      {selected && (
        <PinModal spot={selected} origin={userLocation} initialMode={initialMode} onClose={() => setSelected(null)} onRoute={drawRoute} />
      )}
      <div className="absolute right-4 bottom-4">
        <ThreeJsPinEffect />
      </div>
    </div>
  );
}
