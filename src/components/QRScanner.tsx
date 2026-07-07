'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function QRScanner({ onDetected }: { onDetected: (url: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let rafId: number;
    let mounted = true;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!mounted) return;
        if (videoRef.current) videoRef.current.srcObject = stream;
        videoRef.current?.play();

        const jsqr = (await import('jsqr')).default || (await import('jsqr'));

        const tick = () => {
          if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
            rafId = requestAnimationFrame(tick);
            return;
          }

          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsqr(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            onDetected(code.data);
          } else {
            rafId = requestAnimationFrame(tick);
          }
        };

        rafId = requestAnimationFrame(tick);
      } catch (e: any) {
        setError(String(e.message || e));
      }
    }

    start();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [onDetected]);

  return (
    <div>
      {error && <div className="text-red-400">カメラ使用エラー: {error}</div>}
      <video ref={videoRef} className="w-full rounded" playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
