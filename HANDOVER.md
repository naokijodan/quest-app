# Quest App - HANDOVER

**最終更新:** 2026-02-25
**現在のPhase:** Phase 1 - MVP
**現在のSprint:** Sprint 2 完了、Sprint 3 着手前

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
- **Latest commit:** `2851bf1` feat: Sprint 2 Phase C - クエスト実行フロントエンド+バックエンド完成
- **Status:** Clean, up to date with origin/main

### 実装済み（Sprint 1 + Sprint 2）

#### Sprint 1（完了）
プロジェクト初期化、認証（Google/Email/Magic Link）、UIコンポーネント、ミドルウェア

#### Sprint 2（完了）
**Phase A: Supabase接続**
- [x] Supabase CLI導入、ローカル環境構築
- [x] `.env.local` 設定（ローカルSupabase接続）
- [x] DBマイグレーション適用（4テーブル: users, preset_quests, quest_runs, user_daily_quotas）
- [x] シードデータ投入（10プリセットクエスト）
- [x] TypeScript型生成（database.ts）

**Phase B: 最小オンボーディング**
- [x] 3ステップウィザード（名前→アバター→マスコット）
- [x] Server Action（completeOnboarding）
- [x] username重複チェック
- [x] オンボーディング完了後のリダイレクト

**Phase C: クエスト実行（MVP核心）**
- [x] Anthropic SDK初期化（client.ts, stream.ts, templates.ts）
- [x] POST /api/quest/execute SSEストリーミングAPI Route
  - 認証チェック、カテゴリアクセス制御、デイリークォータ
  - quest_runステータス管理、XP加算、レベルアップ判定
  - マスコット進捗メッセージ（猫/犬）
- [x] Server Actions（クエスト一覧、詳細、履歴取得）
- [x] ホーム画面（認証状態で分岐: ランディング/クエスト一覧）
- [x] (main)レイアウト（ヘッダー+ユーザー情報）
- [x] クエスト詳細画面（動的入力フォーム）
- [x] 実行中画面（SSEストリーミング+マスコット演出）
- [x] 結果表示画面（コピー+XP演出+レベルアップモーダル）
- [x] useQuestExecutionフック（SSE接続管理）

### ファイル構成（Sprint 2終了時点）
```
src/
├── app/
│   ├── (auth)/login/page.tsx, register/page.tsx, layout.tsx
│   ├── (main)/layout.tsx, quest/[id]/page.tsx
│   ├── api/quest/execute/route.ts
│   ├── auth/callback/route.ts
│   ├── onboarding/page.tsx
│   ├── layout.tsx, page.tsx (統合: ランディング+ホーム)
│   └── globals.css
├── components/ui/ (Button, Card, Input, Modal, Toast)
├── features/
│   ├── auth/actions/index.ts
│   ├── gamification/types/index.ts
│   ├── onboarding/components/ (OnboardingWizard, StepName, StepAvatar, StepMascot, StepComplete)
│   ├── onboarding/actions/index.ts
│   ├── quest/actions/index.ts
│   ├── quest/components/ (QuestCard, QuestInputForm, QuestExecution, QuestResult)
│   ├── quest/hooks/useQuestExecution.ts
│   └── quest/types/schema.ts
├── lib/
│   ├── anthropic/ (client.ts, stream.ts, templates.ts)
│   ├── supabase/ (client.ts, server.ts, middleware.ts)
│   └── utils/cn.ts
├── stores/ (userStore.ts, questStore.ts, uiStore.ts)
├── types/ (index.ts, database.ts)
└── middleware.ts
```

### 接続状況
- Supabase: ローカル開発環境で接続済み（`supabase start`で起動）
- Anthropic API: SDK実装済み、`.env.local`にAPIキー設定が必要
- Upstash Redis: Sprint 3 で接続予定

---

## コンテキスト管理ルール

### 引き継ぎタイミング
- **残り30%** で開発停止 → 引き継ぎ作業へ
- **引き継ぎ作業に15-20%** の余力を確保
- **SSE/RLS/認証タスクは途中切断禁止**（機能の区切りで引き継ぎ）

### 引き継ぎ時の必須アクション
1. HANDOVER.md 更新（現在の状態、未解決課題、次タスク）
2. git commit & push
3. Obsidianノート作成（`開発ログ/quest-app_*.md`）
4. Discord通知
5. `QUEST_APP_NEXT_SESSION_PROMPT.txt` を更新（次タスク・最新コミット反映）
6. 更新した引き継ぎ文を画面に出力（ユーザーがコピペで次セッションに貼る）

### セッション終了時の出力フォーマット
引き継ぎ文は1-2行で簡潔に。詳細はHANDOVER.mdに書く。
```
Quest Appの[Sprint/Phase]を継続。[次タスク]から自律的に進めて。確認不要。コーディングはCodex CLI / Gemini CLIに委託すること。
参照: /Users/naokijodan/Desktop/quest-app/HANDOVER.md
```

---

## 次のタスク

### Sprint 3 Phase A: ホーム画面の仕上げ
- [ ] XPプログレスバー（ヘッダーまたはホーム画面）
- [ ] カテゴリ日本語名の表示（basic→基本, business→ビジネス等）
- [ ] サインアウトボタン

### Sprint 3 Phase B: 履歴画面
- [ ] /history ページ（実行履歴一覧）
- [ ] 過去の結果を再表示
- [ ] ステータスバッジ（完了/失敗/キャンセル）

### Sprint 3 Phase C: ゲーミフィケーション強化
- [ ] レベルアップ演出の改善
- [ ] XP獲得アニメーション
- [ ] デイリークォータ表示（残り回数）

### Sprint 3 Phase D: PWA + デプロイ準備
- [ ] serwist（PWA）設定
- [ ] manifest.json の完備
- [ ] E2Eテスト（メインフロー）
- [ ] Vercelデプロイ設定

---

## 既知の問題

| 問題 | 影響 | 対応 |
|------|------|------|
| middleware.ts非推奨 | ビルド警告のみ | Phase 2でproxy移行 |
| Zod v4 breaking changes | 現行動作に影響なし | このまま |
| npm audit warnings | next依存、実害なし | 定期チェック |
| ANTHROPIC_API_KEY未設定 | クエスト実行不可 | .env.localにキー追加が必要 |
| Supabaseローカルのみ | 本番接続なし | Vercelデプロイ時にリモートSupabase設定 |

---

## 高リスク領域の参照ファイル一覧（変更時は必ず確認）

| 領域 | ファイル |
|------|---------|
| SSE型定義 | `src/types/index.ts` (QuestSSEEvent) |
| SSE API Route | `src/app/api/quest/execute/route.ts` |
| DB Schema | `supabase/migrations/00001_initial_schema.sql` |
| RLS Policy | 同上（CREATE POLICY セクション） |
| Auth Actions | `src/features/auth/actions/index.ts` |
| Auth Callback | `src/app/auth/callback/route.ts` |
| Middleware | `src/lib/supabase/middleware.ts` |
| Supabase Client | `src/lib/supabase/client.ts`, `server.ts` |
| Quest Schemas | `src/features/quest/types/schema.ts` |
| Gamification | `src/features/gamification/types/index.ts` |
| Anthropic Client | `src/lib/anthropic/client.ts`, `stream.ts` |

---

## 禁止事項（全AIに適用）

- middleware.ts の変更（Claudeに報告して判断を仰ぐ）
- RLSポリシーの変更（同上）
- dangerouslySetInnerHTML の使用
- console.log の残置
- ハードコードされたシークレット
- 新しいAPI Routeの作成（/api/quest/execute 以外）
