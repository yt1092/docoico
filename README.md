# DOCOICO

DOCOICO（どこいこ） — リアルタイムデータで「今この瞬間最高のスポット」を提案する観光・デートスポット発見アプリのプロトタイプ。

## このリポジトリの目的
- Step 1: Next.js + TypeScript の骨組みを作成
- 今後、Supabase スキーマ・認証・リアルタイム投票・LLM連携などを実装します

## 技術スタック
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion / GSAP / Lottie
- Three.js
- Google Maps API + Maplibre GL JS
- Supabase (Postgres + Realtime + Auth)
- Gemini (LLM)

## ローカル開発
1. 依存インストール
```bash
npm install
```
2. 環境変数を `.env.local` に設定（下の `.env.example` を参照）
3. 開発サーバー起動
```bash
npm run dev
```

## 現在の実装範囲（Step 1）
- Next.js アプリ骨組み（`src/app`）
- 簡易APIヘルスチェック
- Supabase クライアントの初期化ファイル
- TypeScript 型定義の雛形
- README と `.env.example`

## 次にやること
1. Supabase テーブル定義（Step 2）
2. 認証（Google / LINE / ゲスト）実装（Step 2.5）

## Supabase スキーマ
スキーマ定義ファイルを `supabase/schema.sql` に用意しています。SupabaseコンソールのSQLエディタに貼り付けて実行するか、プロジェクトに合わせてマイグレーションを行ってください。

簡単な適用手順:

1. Supabaseのプロジェクトを作成
2. 左サイドバー → `SQL` → `New query` を開く
3. `supabase/schema.sql` の内容を貼り付けて `Run` を押す

注: 本番環境ではRLS（Row Level Security）ポリシーと適切なインデックスを追加してください。


## デプロイ (Vercel)

簡単に Vercel にデプロイできます。`vercel.json` を用意しています。

1. Vercel に GitHub リポジトリを接続
2. 環境変数を Vercel のダッシュボードで設定（`.env.example` のキーを参考に）
3. 自動デプロイが開始されます

開発環境でのテスト:
```bash
npm install
npm run dev
```

## CI / GitHub Actions

このリポジトリには基本的なCIワークフローを用意しています: `.github/workflows/ci.yml` が `push` / `pull_request` をトリガーに `npm ci` と `npm run build` を実行します。

Vercel にデプロイする際は、Vercel プロジェクトの環境変数に `.env.example` にあるキーを設定してください。Vercel は GitHub 連携を通じて自動デプロイ可能です。

環境変数の設定例（Vercel ダッシュボードで追加）:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
GEMINI_API_KEY
INSTAGRAM_ACCESS_TOKEN
TWITTER_BEARER_TOKEN
```

ヒント: 本番環境で `SUPABASE_SERVICE_ROLE_KEY` を使用する際は、クライアントに露出しないよう Vercel のダッシュボードにシークレットとして設定してください。

## 自動デプロイ（GitHub → Vercel）

このリポジトリには GitHub Actions のデプロイワークフローを追加しています: `.github/workflows/deploy.yml`。
ワークフローは `main` / `master` への push をトリガーに Vercel へビルド済みアーティファクトをデプロイします。

必要な GitHub Secrets をリポジトリの Settings → Secrets に設定してください:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

`VERCEL_TOKEN` は Vercel の Personal Token（Vercel Settings → Tokens）から発行します。`VERCEL_ORG_ID` と `VERCEL_PROJECT_ID` は Vercel プロジェクトの設定画面で確認できます。

基本手順:

1. GitHub にリポジトリを作成してコードを push
2. Vercel で新しいプロジェクトを作成（既存プロジェクトを使う場合は `VERCEL_*` 情報を確認）
3. GitHub のリポジトリ Settings → Secrets に上記シークレットを登録
4. `main` ブランチに push すると自動でワークフローが実行され、Vercel にデプロイされます。

---

## Git と Vercel のハンズオン手順

以下の手順で Git の初期化、GitHub への push、Vercel へのデプロイまで進められます。Windows 用の補助スクリプトを `scripts/init-repo.ps1` に用意しました（`gh` CLI を使います）。

1) 前提
- `git` と `gh`（GitHub CLI）をインストール。
- `gh auth login` で GitHub にログインしておく。

2) 自動化スクリプト（Windows PowerShell）

プロジェクトルートで次を実行します:

```powershell
./scripts/init-repo.ps1 -RepoOwner 'your-username' -RepoName 'docoico' -Private:$false
```

スクリプトは `git init` → commit → `gh repo create` → push まで試みます。既にリポジトリがある場合は既存 remote に push する挙動になります。

3) 手動手順（代替）

```bash
git init
git add .
git commit -m "Initial commit: prepare CI and Vercel deploy"
git branch -M main
git remote add origin https://github.com/<your-username>/docoico.git
git push -u origin main
```

4) Vercel セットアップ（GUI 操作）
- Vercel にログインし、`New Project` → `Import` で GitHub リポジトリを選択。
- Build Command: `npm run vercel-build`（デフォルトは `next build` で問題ありません）。
- Output Directory: 空のまま（Next.js App Router は自動判別）。
- 環境変数（Project Settings → Environment Variables）に README に記載のキーを追加。

5) GitHub Secrets（自動デプロイワークフローを使う場合）
- GitHub リポジトリ Settings → Secrets に次を設定:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

これらを設定後、`main` に push すれば `.github/workflows/deploy.yml` が Vercel に自動デプロイします。

疑問があれば次のどれを実行しましょうか？短く選んでください:
- 私に GitHub へ push を代行してほしい（要: `gh` 認証はあなたの端末で行ってください）
- あなたがスクリプトを実行するので、実行時に出たログを共有してほしい
- Vercel の環境変数設定を一緒に画面を見ながら進めたい（手順を案内）



## 認証セットアップ（Google / LINE / ゲスト）

1) Supabase側
- Supabase コンソール → Authentication → Settings → External OAuth Providers を開き、Google と LINE を有効化します。
- 各プロバイダに対応する `Client ID` / `Client Secret` を設定します。

2) Google OAuth (Google Cloud)
- Google Cloud Console で OAuth クライアントを作成。
- Authorized redirect URIs に `https://your-project.supabase.co/auth/v1/callback`（SupabaseのリダイレクトURL）とローカル開発用に `http://localhost:3000` を追加。
- クライアントID / シークレットを Supabase の設定に貼り付ける。

3) LINE Login (LINE Developers)
- LINE Developers でチャネルを作成し、チャネル設定でCallback URLに Supabase のリダイレクトURLを設定。
- Channel ID / Channel secret を Supabase の LINE 設定欄に貼り付ける。

4) ゲストモード
- ゲストはログイン不要で利用可能。アプリはローカルにゲストプロファイルを保存します（`localStorage`）。

5) 実装のポイント
- フロントエンドは `src/components/AuthButtons.tsx` を参照。`supabase.auth.signInWithOAuth` を使いワンクリックでOAuthログインします。
- ログイン後は `src/components/AuthProvider.tsx` が `profiles` テーブルへユーザ情報の upsert を試みます。


## 環境変数（必須）
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- GEMINI_API_KEY
- OPENWEATHER_API_KEY
- INSTAGRAM_ACCESS_TOKEN
- TWITTER_BEARER_TOKEN

---
作業を分割して順に実装します。次にSupabaseスキーマの雛形を作成しますか？

## API 使用例（履歴・お気に入り）

以下のエンドポイントを実装済みです（認証が必要）：

- `GET /api/history` — 認証ユーザの訪問履歴を取得
- `POST /api/history` — 履歴追加（body: `{ "spot_id": "<uuid>", "note": "..." }`）
- `GET /api/favorites` — 認証ユーザのお気に入り取得
- `POST /api/favorites` — お気に入り追加（body: `{ "spot_id": "<uuid>" }`）
- `DELETE /api/favorites?id=<favorite_id>` — お気に入り削除

サンプル（ブラウザでの呼び出し）:

```javascript
const token = '<SUPABASE_ACCESS_TOKEN>'; // supabase.auth.getSession() などで取得

fetch('/api/history', { headers: { Authorization: `Bearer ${token}` } })
	.then(res => res.json())
	.then(console.log);

fetch('/api/favorites', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
	body: JSON.stringify({ spot_id: 'uuid-of-spot' })
}).then(r => r.json()).then(console.log);
```

## セキュリティとRLSポリシー（テンプレート）

このプロジェクトではサーバー側で管理操作を行うために `SUPABASE_SERVICE_ROLE_KEY` を利用します。`.env.local` にサービスロールキーを設定してください（絶対にクライアントに公開しないでください）。

サンプルRLSテンプレート（`sessions` テーブルの読み書きポリシー例）:

```sql
-- allow authenticated users to insert their own profiles
create policy "profiles_insert_authenticated" on profiles
	for insert using (auth.role() = 'authenticated');

-- allow users to read their own history
create policy "history_user_read" on user_history
	for select using (auth.uid() = user_id);

-- allow users to insert their own history
create policy "history_user_insert" on user_history
	for insert with check (auth.uid() = user_id);
```

注意: 上のポリシーは例です。実際のアプリではより厳密に検討してください。

## 自動集計とAI提案フロー

- 投票が目標人数 (`sessions.expected_count`) に達すると、ホスト側UIで自動的に `/api/sessions/aggregate` が呼ばれます。
- 集計 API は投票を集計し、内部で `/api/recommend` に集計データを投げてLLMの推奨をトリガーします。
- 現在 `/api/recommend` はプロンプト生成までを実装した雛形です。Gemini API 呼び出しとレスポンスパースをこれから実装します。

### Gemini（LLM）連携と切り替え

- 環境変数 `GEMINI_API_KEY` にAPIキーを設定し、`ENABLE_GEMINI=true` を `.env.local` に追加すると、サーバー側で実際のGemini呼び出しが有効になります。
- デフォルトでは無効（`ENABLE_GEMINI=false`）で、`/api/recommend` は生成したプロンプトを返します。キーを後から追加して切り替え可能です。
- LLMのAPIエンドポイントをカスタムにする場合は `GEMINI_API_URL` を設定してください。

例:

```
ENABLE_GEMINI=true
GEMINI_API_KEY=ya29....
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5:generateText
```

## リアルタイム外部APIの有効化

環境変数で各APIを有効化できます（`.env.local` に設定）。例:

```
ENABLE_OPENWEATHER=true
ENABLE_GOOGLE_PLACES=true
ENABLE_GOOGLE_DIRECTIONS=true
ENABLE_SOCIAL=false
OPENWEATHER_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
INSTAGRAM_ACCESS_TOKEN=...
TWITTER_BEARER_TOKEN=...
```

各エンドポイント:
- `GET /api/weather?lat={lat}&lng={lng}`
- `GET /api/places?lat={lat}&lng={lng}&keyword={keyword}`
- `GET /api/directions?origin={a}&destination={b}&mode={walking|driving|transit}`
- `GET /api/social?q={query}`
- `GET /api/sunrise?lat={lat}&lng={lng}`

## 地図とピン表示 (Step 8)

`/map` ページを追加しました。現在地中心で `spots` テーブルからスポットを読み込み、ピンを表示します。ピンをタップすると `PinModal` が開き、SNS概要・快適度・お気に入り・ルート案内ボタンが表示されます。

要: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` を `.env.local` に設定してください。

## 現在の状態（2026-07-07 時点の作業ログ）

このセクションは、開発を別セッション/別担当者が引き継ぐ際に状況を把握できるようにするためのメモです。チャット履歴は残らないため、進捗はここに追記していく方針です。

### デプロイ環境
- Vercelプロジェクト: `docoico/docoico_kcl-hack2026`（本番URL: `https://docoicokcl-hack2026.vercel.app`）
- Supabaseプロジェクト: `lfavnbcowqlxdtovulpy`（`supabase/schema.sql` 適用済み、`supabase/rls_policies.sql` も適用済み）
- 本番環境変数（Vercel）: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `OPENWEATHER_API_KEY` / `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 設定済み
- `GEMINI_API_KEY` は **意図的に未設定**（下記「AI提案の実装方針」参照）
- GitHubへのpushからの自動デプロイは未検証。今のところ `vercel --prod` で手動デプロイして反映している

### 実装済みの機能
- モード選択（カップル/フレンズ/ソロ）→ 質問フロー（気分/雰囲気/ジャンル/予算、各5〜6択、前の質問に戻る・やり直す機能あり）→ AIおすすめ表示 → 地図でルート確認、の一連の流れ
- フレンズモード: QRコード生成 → 匿名投票（Supabase Realtime）→ 集計 → 提案
- 認証: メール/パスワード（新規登録・ログイン、パスワード表示切替）、ゲストモード（localStorage）。**Google/LINEログインはボタンのみ実装済みで、Supabase側の外部プロバイダ設定（OAuthクライアント作成）が未完了のため実際には使えない**
- マイページ（`/mypage`）: プロフィール表示、モード選択、お気に入り一覧（ログイン時はSupabase、ゲスト時はlocalStorage）、訪問履歴（ログイン時のみ）
- 地図（`/map`）: ピン表示、AIおすすめスポットのハイライト表示、ルート検索（ポリラインを実際に地図上に描画）
- トップページ（`/`）: 企業サイト風のランディングページ

### AI提案の実装方針（重要）
`/api/recommend` は当初Gemini APIを使う設計だったが、開発中にユーザーのGoogle CloudアカウントでGemini APIの無料枠が使えない状態（`limit: 0` → 請求設定後は「prepayment credits depleted」）であることが判明。ユーザーの意向で **「無料で使える範囲で動くもの」を優先する方針に変更**し、以下のように実装している。

- `GEMINI_API_KEY` が設定されていない場合、Gemini呼び出しをスキップし、**ルールベースの代替ロジック**（`buildFallbackSpots` in `src/app/api/recommend/route.ts`）でおすすめを生成する
  - Google Places APIで取得した周辺スポットの評価・レビュー数・混雑度・渋滞状況から快適度スコアを算出してランキング
- 将来 `GEMINI_API_KEY` を設定すれば、コード変更なしで自動的にGemini生成に切り替わる（`ENABLE_GEMINI` で明示的に無効化も可能）
- X(Twitter) APIの「検索」機能は無料プランに含まれないため未実装（`TWITTER_BEARER_TOKEN` 未設定でも問題なく動作する設計）
- Instagram APIはFacebook Developer登録等が複雑なため保留

### セキュリティ・コスト面の注意点
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` はブラウザに露出するため、Google Cloud ConsoleでAPI制限（Maps JavaScript API / Places API / Directions APIのみ許可）とHTTPリファラー制限（本番ドメイン + `localhost`）を必ず設定すること
- Google CloudとGeminiの請求設定・予算アラートの設定状況は要確認（本READMEの更新時点では未確認）
- Supabase / Vercelは無料枠の上限に達すると機能停止する形が基本で、従量課金による予期しない請求は基本的に発生しない設定（Hobbyプラン）

### 未着手・今後の課題
- Google/LINE OAuthのSupabase側設定（README内「認証セットアップ」章に手順あり）
- Instagram/X SNS連携の実データ化
- カップルモードでの2人紐付け機能
- スポット決定時のGSAP演出、ページ遷移アニメーション
- 地図ピンの「ジャンルラベルのみ表示（タップで詳細）」仕様への対応


