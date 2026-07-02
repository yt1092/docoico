import React from 'react';
import MapView from '../../components/MapView';

export default function MapPage() {
  return (
    <main className="min-h-screen p-6">
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">地図でスポットを探す</h2>
        <MapView />
      </section>
    </main>
  );
}
