'use client';
import React, { useEffect, useRef, useState } from 'react';
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
      const mapObj = new (window as any).google.maps.Map(mapRef.current, { center: { lat: 35.68, lng: 139.76 }, zoom: 14, mapId: '' });
      setMap(mapObj);

      navigator.geolocation.getCurrentPosition(pos => {
        mapObj.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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
      setMarkers(createdMarkers);
    }
  }, []);

  return (
    <div className="relative h-[70vh] rounded overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {selected && (
        <PinModal spot={selected} onClose={() => setSelected(null)} />
      )}
      <div className="absolute right-4 bottom-4">
        <ThreeJsPinEffect />
      </div>
    </div>
  );
}
