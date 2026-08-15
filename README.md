# 診断士 Sprint v2

2027年度の中小企業診断士試験に向けた、演習中心・オフラインファーストの個人用PWAです。未出題、誤答率、復習期限、最終回答日を合成して次の問題を決めます。

## 現在の実装範囲

- モバイル優先のDashboard（今日の学習数、7科目正答率、30日推移、要復習数、40点未満警告、60点到達確率の簡易推定）
- Adaptive quiz（1/5/10/20問、科目・論点・年度フィルタ、「迷った」、即時フィードバック）
- SM-2を参考にした軽量な復習スケジューリング（confidenceを含む）
- 弱点ノート（誤答・迷い、メモ、3回連続正解で卒業）
- IndexedDB（Dexie）による端末内永続化
- 学習データのJSONエクスポート／復元
- PWAマニフェストとproduction用Service Worker
- 適応スコア・復習日程のVitest、主要演習フローのPlaywrightテスト
- 再利用可能なオリジナル例題9問

未実装の次フェーズは、Exam mode、問題JSON/CSVインポート、Learning plan、Second-stage mode、Supabase同期です。

> 移行上の注意: 作業開始時のディレクトリは空で、ブリーフに記載された旧 `index.html` は提供されていませんでした。そのため、旧MVPとの画面・挙動比較による回帰確認は未実施です。

## 必要環境

- Node.js 22 LTS
- pnpm 11.19.0（`corepack enable` で有効化）

## ローカル起動

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

ブラウザで <http://localhost:3000> を開きます。ログインは不要です。初回表示時にサンプル問題がIndexedDBへ投入されます。

## 検証

```bash
pnpm typecheck
pnpm test
pnpm exec playwright install
pnpm test:e2e
pnpm build
pnpm start
```

PWAのService Workerはproduction buildでのみ有効です。iPhone/iPadでは、同一LAN上のHTTPS環境またはデプロイ先をSafariで開き、「共有」→「ホーム画面に追加」でインストールします。

## データと著作権

回答履歴、復習状態、メモは `shindanshi-sprint-v2` IndexedDBに保存されます。「データ」画面からJSONでバックアップ・復元できます。

市販の受験教材や有料問題を許諾なくスクレイピング・転載しないでください。取り込む問題は、オリジナル、ユーザー自身が利用許諾を持つもの、または再利用条件が明確なものに限定してください。各問題には `source` と `license` を必須で保持します。

## ディレクトリ

```text
src/app/             Next.js App Routerの画面
src/components/      共通ナビゲーションと初期データ投入
src/lib/db.ts        Dexieスキーマ
src/lib/adaptive.ts  適応出題スコア
src/lib/review.ts    復習スケジューリング
src/lib/seed.ts      オリジナル例題
e2e/                 Playwrightスモークテスト
```
