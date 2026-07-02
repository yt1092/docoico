'use client';
import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export default function LottieLoader({ animationData }: { animationData: any }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current || !animationData) return;
    const anim = lottie.loadAnimation({ container: ref.current, renderer: 'svg', loop: true, autoplay: true, animationData });
    return () => anim.destroy();
  }, [animationData]);
  return <div ref={ref} className="w-24 h-24" />;
}
