'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 }
};

export default function ModeCard({ emoji, title, mode }: { emoji: string; title: string; mode?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      variants={cardVariant}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 120 }}
    >
      <Link href={`/mode/${mode ?? title}`} className="block bg-[#121018] p-6 rounded-xl shadow-md border border-gray-800 hover:opacity-95">
        <div className="text-3xl mb-2">{emoji}</div>
        <div className="text-lg font-semibold">{title}</div>
      </Link>
    </motion.div>
  );
}
