import './globals.css';
import React from 'react';

export const metadata = {
  title: 'DOCOICO',
  description: '今この瞬間最高のスポットを提案するサービス'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#0b0b10] text-white antialiased">{children}</body>
    </html>
  );
}
