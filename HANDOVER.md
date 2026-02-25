# Quest App - HANDOVER

**最終更新:** 2026-02-25
**現在のPhase:** 実装Phase 2（通常クエストのCLI化）完了 → Phase 2残タスク or Phase 3着手
**現在のSprint:** Sprint 6 Phase 2 主要タスク完了

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
- **Latest commit:** Phase 1 Agent基盤実装
- **Status:** クリーン（コミット済み）

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
   - WebSocketサーバー（ws://localhost:3939）
   - child_process.spawn によるCLI実行（claude/codex/gemini）
   - stdout/stderrリアルタイム転送
   - HTTPヘルスチェック（/health + CORS対応）
   - ワンタイムトークン認証（~/.quest-app/agent-token.json）
   - コマンドホワイトリスト・サンドボックスセキュリティ
   - タイムアウト管理・プロセスキャンセル
2. [x] `src/lib/agent/` — PWA側Agent接続クライアント
   - AgentClient クラス（接続・再接続・メッセージ送受信）
   - シングルトンパターン（getAgentClient）
   - HTTPヘルスチェック・WebSocket ping/pong
3. [x] `src/features/quest/hooks/useAgentConnection.ts` — 接続状態管理フック
   - autoConnect（ヘルスチェック → 自動接続）
   - 利用可能ツール・バージョン取得
4. [x] `useQuestExecution.ts` → WebSocket版に書き換え
   - SSE/fetch → AgentClient.execute() 経由
   - インターフェース完全互換（呼び出し側変更不要）
   - Agent未接続時エラーメッセージ
5. [x] `@anthropic-ai/sdk` 依存削除、`src/lib/anthropic/` 廃止
   - renderTemplate は `src/lib/utils/template.ts` に移動
   - API Route `/api/quest/execute/` 削除

#### Sprint 6 Phase 2: 通常クエストのCLI化（主要完了）
1. [x] `supabase/migrations/00002_phase2_cli_columns.sql` — CLI列追加 + レベル上限10
2. [x] `supabase/seed_phase2.sql` — 10クエストのcli_prompt_template設定
3. [x] `src/types/index.ts` — PresetQuestにCLIフィールド追加
4. [x] `src/features/gamification/types/index.ts` — Lv.1-10対応
5. [x] `src/features/quest/actions/complete-quest.ts` — completeQuestRun Server Action
6. [x] `src/features/quest/hooks/useQuestExecution.ts` — cli_prompt_template + XP計算統合
7. [x] `src/features/quest/components/AgentStatusBanner.tsx` — 接続状態バナー
8. [x] `src/app/(main)/quest/[id]/page.tsx` — AgentStatusBanner統合

### ファイル構成（Phase 2完了時点）
```
quest-app/
├── packages/
│   └── quest-agent/                    ← NEW: ローカルAgent
│       ├── src/
│       │   ├── index.ts               — エントリーポイント
│       │   ├── server.ts              — WebSocketサーバー
│       │   ├── executor.ts            — CLI実行エンジン
│       │   ├── types.ts               — メッセージ型定義
│       │   ├── security.ts            — ホワイトリスト・サンドボックス
│       │   ├── health.ts              — HTTPヘルスチェック
│       │   └── auth.ts                — トークン認証
│       ├── package.json
│       └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx, register/page.tsx, layout.tsx
│   │   ├── (main)/layout.tsx, quest/[id]/page.tsx, history/page.tsx
│   │   ├── api/                       ← quest/execute は削除済み
│   │   ├── auth/callback/route.ts
│   │   ├── onboarding/page.tsx
│   │   ├── layout.tsx, page.tsx
│   │   └── globals.css
│   ├── components/ui/ (Button, Card, Input, Modal, Toast, XpProgressBar)
│   ├── features/
│   │   ├── auth/actions/index.ts, components/SignOutButton.tsx
│   │   ├── gamification/types/index.ts, components/(LevelUpModal, XpGainOverlay, DailyQuota)
│   │   ├── onboarding/components/, actions/
│   │   ├── quest/actions/, components/, hooks/(useQuestExecution, useAgentConnection), types/, constants/
│   │   └── (NEW) adventure/  ← 冒険ルート（未実装）
│   ├── lib/
│   │   ├── agent/ (client.ts, types.ts, index.ts)  ← NEW: Agent接続クライアント
│   │   ├── supabase/ (client.ts, server.ts, middleware.ts)
│   │   └── utils/ (cn.ts, template.ts)
│   ├── stores/ (userStore.ts, questStore.ts, uiStore.ts)
│   ├── types/ (index.ts, database.ts)
│   └── middleware.ts
└── codex/ (current-task.txt, TASK_TEMPLATE.md)
```

### 接続状況
- Supabase: ローカル開発環境で接続済み（`supabase start`で起動）
- Anthropic API: **廃止済み**（SDK削除、ファイル削除完了）
- Quest Agent: **実装完了**（`cd packages/quest-agent && npm run dev` で起動）

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

### 実装Phase 2: 通常クエストのCLI化（主要タスク完了）
1. [x] 既存10クエストをCLI実行版に変換（cli_prompt_template）
2. [ ] サンドボックスディレクトリ実装
3. [x] Agent未接続時のフォールバックUI（AgentStatusBanner）
4. [ ] CLIインストールガイド画面
5. [x] XP計算・DB更新のServer Action（completeQuestRun）
6. [x] DB: preset_questsにCLI列追加 + users.level上限10に拡張
7. [x] ゲーミフィケーション: Lv.1-10対応（LEVEL_THRESHOLDS, calculateLevel等）
8. [x] useQuestExecution: cli_prompt_template + XP Server Action統合

### 実装Phase 3: 冒険ルート
6. [ ] DB追加マイグレーション（adventure_progress、preset_quests拡張、users拡張）
7. [ ] 冒険ルートUI基盤
8. [ ] 第1-5章のクエスト実装
9. [ ] ターミナル風UIコンポーネント
10. [ ] 魔王戦演出

### 実装Phase 4: PWA + デプロイ
11. [ ] serwist（PWA）設定
12. [ ] Vercelデプロイ（PWA配信のみ）

---

## 既知の問題

| 問題 | 影響 | 対応 |
|------|------|------|
| middleware.ts非推奨 | ビルド警告のみ | Phase 2でproxy移行 |
| Zod v4 breaking changes | 現行動作に影響なし | このまま |
| npm audit warnings | next依存、実害なし | 定期チェック |
| Supabaseローカルのみ | 本番接続なし | Vercelデプロイ時にリモートSupabase設定 |
| Gemini CLI未インストール | `which gemini` → not found | 必要時にインストール |
| XP計算がPhase 1では仮値（10XP固定） | **解決済み** | Phase 2で completeQuestRun Server Action実装 |

---

## 高リスク領域の参照ファイル一覧（変更時は必ず確認）

| 領域 | ファイル |
|------|---------|
| 再設計書 | `REDESIGN.md` |
| DB Schema | `supabase/migrations/00001_initial_schema.sql` |
| RLS Policy | 同上（CREATE POLICY セクション） |
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
| Phase 2 Migration | `supabase/migrations/00002_phase2_cli_columns.sql` |

---

## 禁止事項（全AIに適用）

- middleware.ts の変更（Claudeに報告して判断を仰ぐ）
- RLSポリシーの変更（同上）
- dangerouslySetInnerHTML の使用
- console.log の残置
- ハードコードされたシークレット
- Anthropic API直接呼び出しの追加（Agent経由に統一）
