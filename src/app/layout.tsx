import './globals.css';
import React from 'react';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: 'DOCOICO',
  description: '今この瞬間最高のスポットを提案するサービス'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-b from-violet-50 via-white to-amber-50 text-gray-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
