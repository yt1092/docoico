'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ThreeJsPinEffect from './ThreeJsPinEffect';
import PinModal from './PinModal';

declare global {
  interface Window { initMap?: any; }
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const routeLineRef = useRef<any>(null);
  const searchParams = useSearchParams();

  function drawRoute(path: { lat: number; lng: number }[]) {
    if (!map || !path.length) return;
    if (routeLineRef.current) routeLineRef.current.setMap(null);
    const line = new (window as any).google.maps.Polyline({
      path,
      strokeColor: '#7c3aed',
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
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.warn('Google Maps key not set');
      return;
    }

    if ((window as any).google && (window as any).google.maps) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      script.async = true;
      script.onload = () => init();
      document.head.appendChild(script);
    }

    async function init() {
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
  }, [searchParams]);

  return (
    <div className="relative h-[70vh] rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {selected && (
        <PinModal spot={selected} origin={userLocation} onClose={() => setSelected(null)} onRoute={drawRoute} />
      )}
      <div className="absolute right-4 bottom-4">
        <ThreeJsPinEffect />
      </div>
    </div>
  );
}
