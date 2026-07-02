'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJsPinEffect() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const width = 200, height = 200;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const lightGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.2 });
    const glow = new THREE.Mesh(lightGeo, lightMat);
    scene.add(glow);

    let t = 0;
    function animate() {
      t += 0.02;
      glow.scale.set(1 + Math.sin(t) * 0.3, 1 + Math.sin(t) * 0.3, 1);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="w-48 h-48 pointer-events-none" />;
}
