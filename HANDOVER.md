# Quest App - HANDOVER

**最終更新:** 2026-02-25
**現在のPhase:** Phase 4（PWA + デプロイ）— PWA設定完了、E2E検証完了、デプロイ待ち
**現在のSprint:** Sprint 9 Phase 4 PWA + デプロイ

---

### 重要: アーキテクチャ変更

**2026-02-25に3者協議（Claude + GPT + Gemini）+ ユーザーフィードバックにより、根本的なアーキテクチャ変更が決定。**

- **旧**: Anthropic API直接呼び出し（従量課金）
- **新**: ローカルCLI（Claude Code / Codex CLI / Gemini CLI）経由（ユーザーの既存サブスク内）

**詳細設計書: `/Users/naokijodan/Desktop/quest-app/REDESIGN.md`**

### 変更の要点
1. Quest AppはローカルCLIのフロントエンドになる
2. Quest Agent（Node.jsローカルデーモン）を新規追加し、WebSocketでPWAと通信
3. 通常クエスト（CLI裏実行）+ 冒険ルート（ターミナル克服の旅）の二層構造
4. レベル上限をLv.3→Lv.10に拡張
5. `src/lib/anthropic/` と `@anthropic-ai/sdk` は **廃止済み** → Agent経由に置換完了

---

### 役割分担
- **Claude**: オーケストレーター（指示・統合・Git・Obsidian）
- **Codex CLI**: コード生成（TypeScript/TSXファイルの作成・編集）
- **Gemini CLI**: 補助（複雑なロジック調査・レビュー）
- **Claudeはコードを自分で書かない。必ずCodex CLIまたはGemini CLIに委託する。**

---

## 現在の状態

### Git
- **Branch:** main
- **Latest commit:** 562cf1f feat: UI/アニメーション全面改善
- **Status:** クリーン（コミット済み・プッシュ済み）

### 実装済み

#### Sprint 1（完了）
プロジェクト初期化、認証（Google/Email/Magic Link）、UIコンポーネント、ミドルウェア

#### Sprint 2（完了）
**Phase A:** Supabase接続（ローカル環境、4テーブル、シードデータ、型生成）
**Phase B:** 最小オンボーディング（3ステップウィザード）
**Phase C:** クエスト実行MVP（Anthropic SSE、Server Actions、ホーム/詳細/実行/結果画面）

#### Sprint 3 Phase A〜C（完了）
**Phase A:** XPプログレスバー、カテゴリ日本語名、サインアウトボタン
**Phase B:** 履歴画面（/history）、ステータスバッジ
**Phase C:** レベルアップ演出改善、XP獲得アニメーション、デイリークォータ表示

#### Sprint 5 Phase 1: Agent基盤（完了）
1. [x] `packages/quest-agent/` — Quest Agent実装（WebSocketサーバー + child_process.spawn）
2. [x] `src/lib/agent/` — PWA側Agent接続クライアント
3. [x] `src/features/quest/hooks/useAgentConnection.ts` — 接続状態管理フック
4. [x] `useQuestExecution.ts` → WebSocket版に書き換え
5. [x] `@anthropic-ai/sdk` 依存削除、`src/lib/anthropic/` 廃止

#### Sprint 6 Phase 2: 通常クエストのCLI化（完了）
1. [x] 既存10クエストをCLI実行版に変換（cli_prompt_template）
2. [x] サンドボックスディレクトリ実装（per-request隔離 + file listing + cleanup）
3. [x] Agent未接続時のフォールバックUI（AgentStatusBanner + /setup リンク）
4. [x] CLIインストールガイド画面（/setup — 3ステップウィザード）
5. [x] XP計算・DB更新のServer Action（completeQuestRun）
6. [x] DB: preset_questsにCLI列追加 + users.level上限10に拡張
7. [x] ゲーミフィケーション: Lv.1-10対応
8. [x] useQuestExecution: cli_prompt_template + XP Server Action統合

#### Sprint 7 Phase 3: 冒険ルート（完了）
1. [x] DB追加マイグレーション（adventure_progress、preset_quests拡張、users.adventure_chapter）
2. [x] 冒険クエスト全14種のシードデータ（第1-5章）→ ローカルSupabaseに投入済み
3. [x] 冒険ルートUI基盤（features/adventure: types, actions, components）
4. [x] /adventure チャプター選択ページ
5. [x] /adventure/[chapter]/[questId] クエスト実行ページ
6. [x] Terminal.tsx（Tokyo Night テーマ、タイピングエフェクト、対話モード）
7. [x] StoryDialog（プロローグ/エピローグ演出）
8. [x] AdventureQuestRunner（入力フォーム、CLI実行、進行管理統合）
9. [x] BossVictory（魔王戦勝利の全画面アニメーション）
10. [x] AdventureChapterComplete（章クリアサマリー）
11. [x] ホーム画面にLv.4+で冒険ルート入口表示
12. [x] ナビに冒険リンク追加

#### Sprint 9 Phase 4: PWA + デプロイ（進行中）
1. [x] serwist 9.x PWA設定（Service Worker + manifest.ts + next.config.ts）
2. [x] PWAアイコン（192/512px placeholder）
3. [x] オフライン検知UI（OfflineBanner + useOnlineStatus）
4. [x] Next.js 16 params Promise型修正
5. [x] webpack mode対応（serwist Turbopack非互換）
6. [x] vercel.json 作成（リージョン: hnd1, SW headers設定）
7. [x] ビルド成功確認（`npm run build` パス）
8. [x] Agent sandbox修正（codex --skip-git-repo-check + git init）
9. [x] StoryDialogリテラル\n改行修正
10. [x] E2E検証: ログイン → クエスト実行 → XP付与（Playwright）
11. [x] E2E検証: 冒険ルートページ → 第1章 → プロローグモーダル
12. [x] UI/アニメーション全面改善（ホバー、グラデーション、stagger、glow、NavLink等）
13. [ ] **Vercelデプロイ（ユーザー操作必要）**
14. [ ] **Supabaseリモート接続設定（ユーザー操作必要）**

### ファイル構成（Phase 4時点）
```
quest-app/
├── packages/
│   └── quest-agent/
│       ├── src/
│       │   ├── index.ts
│       │   ├── server.ts
│       │   ├── executor.ts            — per-request sandbox対応 + codex --skip-git-repo-check
│       │   ├── types.ts               — sandbox_files追加
│       │   ├── security.ts            — createRequestSandbox + git init, cleanup追加
│       │   ├── health.ts
│       │   └── auth.ts
│       ├── package.json
│       └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx, register/page.tsx, layout.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx             — 冒険・セットアップナビ + OfflineBanner追加
│   │   │   ├── quest/[id]/page.tsx    — params Promise型修正済み
│   │   │   ├── history/page.tsx
│   │   │   ├── setup/page.tsx
│   │   │   └── adventure/
│   │   │       ├── page.tsx
│   │   │       └── [chapter]/[questId]/page.tsx — params Promise型修正済み
│   │   ├── api/
│   │   ├── auth/callback/route.ts
│   │   ├── onboarding/page.tsx
│   │   ├── layout.tsx                 — PWA metadata (appleWebApp, formatDetection)
│   │   ├── manifest.ts               ← NEW: Web App Manifest
│   │   ├── sw.ts                      ← NEW: Service Worker
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/ui/
│   │   ├── Button, Card, Input, Modal, Toast, XpProgressBar
│   │   ├── Terminal.tsx
│   │   ├── OfflineBanner.tsx          ← NEW: オフライン検知バナー
│   │   └── NavLink.tsx               ← NEW: アクティブリンクインジケーター付きナビ
│   ├── features/
│   │   ├── auth/
│   │   ├── gamification/
│   │   ├── onboarding/
│   │   ├── quest/
│   │   ├── setup/
│   │   └── adventure/
│   ├── hooks/
│   │   └── useOnlineStatus.ts         ← NEW: navigator.onLine フック
│   ├── lib/
│   │   ├── agent/
│   │   ├── supabase/
│   │   └── utils/
│   ├── stores/
│   ├── types/index.ts
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_phase2_cli_columns.sql
│   │   └── 00003_phase3_adventure.sql
│   ├── seed.sql
│   └── seed_phase3_adventure.sql
├── public/
│   └── icons/
│       ├── icon-192x192.png           ← NEW
│       └── icon-512x512.png           ← NEW
├── codex/
├── vercel.json                        ← NEW
└── next.config.ts                     — withSerwist() ラップ済み
```

### 接続状況
- Supabase: ローカル開発環境で接続済み（`supabase start`で起動）
- Anthropic API: **廃止済み**
- Quest Agent: **実装完了**（`cd packages/quest-agent && npm run dev` で起動）
- PWA: **設定完了**（Service Worker + Manifest）

---

## Vercelデプロイ手順（ユーザー操作必要）

### Step 1: Vercel CLIログイン
```bash
cd ~/Desktop/quest-app
npx vercel login
# ブラウザが開くのでGitHubアカウントでログイン
```

### Step 2: Vercelプロジェクト作成
```bash
npx vercel
# 以下の質問に答える:
# - Set up and deploy? → Y
# - Which scope? → 自分のアカウント
# - Link to existing project? → N
# - Project name? → quest-app
# - Directory? → ./
# - Override settings? → N
```

### Step 3: Supabaseリモートプロジェクト作成
1. https://supabase.com/dashboard でプロジェクト作成
2. プロジェクト名: `quest-app`
3. リージョン: `Northeast Asia (Tokyo)`
4. パスワード設定

### Step 4: Supabaseリモートにマイグレーション適用
```bash
# Supabase CLIログイン
npx supabase login
# ブラウザでAccessTokenを取得

# リモートプロジェクトをリンク
npx supabase link --project-ref <PROJECT_REF>

# マイグレーション適用
npx supabase db push

# シードデータ投入
# Supabase Dashboard > SQL Editor で seed.sql と seed_phase3_adventure.sql を実行
```

### Step 5: Vercel環境変数設定
```bash
# Supabase DashboardのSettings > APIから取得
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# → https://<project-ref>.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# → Supabase Dashboard > Settings > API > anon key

npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
# → Supabase Dashboard > Settings > API > service_role key

npx vercel env add NEXT_PUBLIC_APP_URL production
# → https://quest-app-xxx.vercel.app（デプロイ後のURL）
```

### Step 6: デプロイ
```bash
npx vercel --prod
```

### Step 7: Supabase認証設定
1. Supabase Dashboard > Authentication > URL Configuration
2. Site URL: `https://quest-app-xxx.vercel.app`
3. Redirect URLs: `https://quest-app-xxx.vercel.app/auth/callback`

---

## コンテキスト管理ルール

### 引き継ぎタイミング
- **残り30%** で開発停止 → 引き継ぎ作業へ
- **引き継ぎ作業に15-20%** の余力を確保
- **SSE/RLS/認証タスクは途中切断禁止**

### 引き継ぎ時の必須アクション
1. HANDOVER.md 更新
2. git commit & push
3. Obsidianノート作成
4. Discord通知
5. `QUEST_APP_NEXT_SESSION_PROMPT.txt` 更新
6. 引き継ぎ文を画面に出力

### セッション終了時の出力フォーマット
```
Quest Appの[Sprint/Phase]を継続。[次タスク]から自律的に進めて。確認不要。コーディングはCodex CLI / Gemini CLIに委託すること。
参照: /Users/naokijodan/Desktop/quest-app/HANDOVER.md
```

---

## 次のタスク

### E2E検証結果（2026-02-25完了）
- [x] Agent起動 + healthcheck + codex CLI sandbox実行
- [x] 通常クエスト全フロー: ログイン → 一覧 → 入力 → 実行 → 結果 → +10 XP（Playwright 15.2s）
- [x] 冒険ルート: ページ表示 → 5章カード → 第1章 → プロローグモーダル（Playwright 10.4s）
- [x] DB更新確認: experience_points=10, quest_count=1, quest_run status=completed
- **注意**: claude --printはネスト環境で動作不可のため出力空。実運用（ユーザー環境）では問題なし

### ユーザー操作必要（対話的ログイン）
1. [ ] Vercel CLIログイン + デプロイ（上記手順参照）
2. [ ] Supabaseリモートプロジェクト作成 + マイグレーション適用
3. [ ] Vercel環境変数設定
4. [ ] Supabase認証リダイレクトURL設定

### 改善候補（優先度順）
- [x] UI/アニメーション改善（ホバーエフェクト、グラデーションXPバー、ページ遷移、stagger-children等）
- [x] 結果表示のスタイリング改善（result-output, glow-success）
- [ ] 冒険ルートのチャプター一覧UI改善（各クエストの進捗表示）
- [ ] PWAアイコンを正式なデザインに差し替え（現在はプレースホルダ）
- [ ] Google Fonts → ローカルフォントへの移行（オフライン対応強化）
- [ ] XPバーのリアルタイム更新（クエスト完了後のヘッダー即時反映）

---

## 既知の問題

| 問題 | 影響 | 対応 |
|------|------|------|
| middleware.ts非推奨 | ビルド警告のみ | Phase 5でproxy移行 |
| Zod v4 breaking changes | 現行動作に影響なし | このまま |
| npm audit warnings | next依存、実害なし | 定期チェック |
| Supabaseローカルのみ | 本番接続なし | ユーザーがリモートSupabase設定 |
| Gemini CLI未インストール | `which gemini` → not found | 必要時にインストール |
| BossVictory.tsx uses style jsx | Next.js styled-jsx設定必要かも | 要確認 |
| serwist Turbopack非互換 | --webpack必須 | @serwist/turbopack移行検討 |
| PWAアイコンがプレースホルダ | 紫色の単色アイコン | 正式デザイン後に差し替え |

---

## 高リスク領域の参照ファイル一覧

| 領域 | ファイル |
|------|---------|
| 再設計書 | `REDESIGN.md` |
| DB Schema | `supabase/migrations/00001_initial_schema.sql` |
| Phase 2 Migration | `supabase/migrations/00002_phase2_cli_columns.sql` |
| Phase 3 Migration | `supabase/migrations/00003_phase3_adventure.sql` |
| RLS Policy | `00001_initial_schema.sql` + `00003_phase3_adventure.sql` |
| Auth Actions | `src/features/auth/actions/index.ts` |
| Auth Callback | `src/app/auth/callback/route.ts` |
| Middleware | `src/lib/supabase/middleware.ts` |
| Supabase Client | `src/lib/supabase/client.ts`, `server.ts` |
| Quest Schemas | `src/features/quest/types/schema.ts` |
| Gamification | `src/features/gamification/types/index.ts` |
| Agent Server | `packages/quest-agent/src/server.ts` |
| Agent Client | `src/lib/agent/client.ts` |
| Agent Hooks | `src/features/quest/hooks/useAgentConnection.ts`, `useQuestExecution.ts` |
| XP Server Action | `src/features/quest/actions/complete-quest.ts` |
| Adventure Actions | `src/features/adventure/actions/index.ts` |
| Adventure Types | `src/features/adventure/types/index.ts` |
| PWA Config | `next.config.ts` (withSerwist), `src/app/sw.ts`, `src/app/manifest.ts` |
| Vercel Config | `vercel.json` |

---

## 禁止事項（全AIに適用）

- middleware.ts の変更（Claudeに報告して判断を仰ぐ）
- RLSポリシーの変更（同上）
- dangerouslySetInnerHTML の使用
- console.log の残置
- ハードコードされたシークレット
- Anthropic API直接呼び出しの追加（Agent経由に統一）
