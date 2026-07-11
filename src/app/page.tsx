'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';

const FEATURES = [
  { emoji: '🤖', title: 'リアルタイムAI提案', desc: '天気・混雑状況・渋滞状況など今この瞬間のデータをもとに、AIが最適なスポットを提案します。' },
  { emoji: '🗳️', title: 'みんなで多数決', desc: 'フレンズモードならQRコードを共有するだけ。匿名投票でその場にいる全員の希望を集計できます。' },
  { emoji: '🗺️', title: '地図とルート案内', desc: '提案されたスポットはそのまま地図で確認、現在地からのルートと所要時間もすぐ分かります。' },
  { emoji: '❤️', title: 'お気に入り＆履歴', desc: '気になったスポットを保存し、過去に訪れた場所はマイページからいつでも振り返れます。' },
  { emoji: '👫', title: '3つのモード', desc: 'カップル・フレンズ・ソロ、シーンに合わせて最適な提案の受け取り方を選べます。' },
  { emoji: '🔒', title: 'ゲストでもすぐ使える', desc: '会員登録なしでもゲストとして今すぐ利用開始。気に入ったら後からアカウントを作成できます。' }
];

const STEPS = [
  { step: '01', title: 'モードを選ぶ', desc: 'カップル・フレンズ・ソロから今のシーンに合うモードを選択します。' },
  { step: '02', title: '質問に答える', desc: '気分・雰囲気・ジャンル・予算など、簡単な質問にタップで答えるだけ。' },
  { step: '03', title: 'AIが提案', desc: 'リアルタイムデータをもとに、今この瞬間のおすすめスポットが届きます。' },
  { step: '04', title: '地図でルート確認', desc: '気になったスポットはそのまま地図とルートで確認、すぐに向かえます。' }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
};

export default function Page() {
  const { user } = useAuth();
  const primaryHref = user ? '/mypage' : '/login';

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">DOCOICO</span>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-800 transition">特徴</a>
            <a href="#how" className="hover:text-gray-800 transition">使い方</a>
          </nav>
          <Link
            href={primaryHref}
            className="px-4 py-2 text-sm font-semibold bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition"
          >
            {user ? 'マイページへ' : 'ログイン'}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-50 via-white to-amber-50" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-violet-200/40 rounded-full blur-3xl -z-10" />
        <div className="absolute -top-10 -right-24 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl -z-10" />

        <div className="px-4 sm:px-8 py-16 sm:py-28 max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-gray-100 text-xs text-gray-500 shadow-sm mb-6">
              リアルタイムAI × 観光・デート スポット発見
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 leading-tight">
              「どこ行く？」を、<br className="sm:hidden" />
              <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">AIが今すぐ決める。</span>
            </h1>
            <p className="text-gray-500 mt-5 text-base sm:text-lg leading-relaxed">
              天気・混雑・渋滞などリアルタイムデータから、
              <br className="hidden sm:block" />
              「今この瞬間最高のスポット」を提案するアプリ「DOCOICO（どこいこ）」
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link
                href={primaryHref}
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-amber-500 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition"
              >
                はじめる
              </Link>
              <a href="#how" className="px-8 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-white transition">
                使い方を見る
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-4 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">選ばれる理由</h2>
          <p className="text-gray-500 mt-2">その場しのぎの検索では出てこない、今この瞬間だけの提案。</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-violet-200 transition"
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how" className="px-4 sm:px-8 py-16 sm:py-24 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">使い方</h2>
            <p className="text-gray-500 mt-2">4ステップで、今行くべき場所が分かります。</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center sm:text-left"
              >
                <div className="text-sm font-bold text-violet-500 mb-2">{s.step}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 py-16 sm:py-24 max-w-4xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} transition={{ duration: 0.5 }}>
          <div className="bg-gradient-to-r from-violet-600 to-amber-500 rounded-3xl px-6 sm:px-16 py-12 sm:py-16 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">今この瞬間の「行きたい」を見つけよう</h2>
            <p className="text-white/90 mt-3">登録は数秒。ゲストとしてすぐに試すこともできます。</p>
            <Link
              href={primaryHref}
              className="inline-block mt-6 px-8 py-3.5 bg-white text-violet-600 rounded-xl font-semibold shadow-sm hover:shadow-md transition"
            >
              無料ではじめる
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="px-4 sm:px-8 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© 2026 DOCOICO</span>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-gray-600 transition">特徴</a>
            <a href="#how" className="hover:text-gray-600 transition">使い方</a>
            <Link href={primaryHref} className="hover:text-gray-600 transition">はじめる</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
