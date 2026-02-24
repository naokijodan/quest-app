# Quest App - HANDOVER

**最終更新:** 2026-02-25
**現在のPhase:** アーキテクチャ再設計完了、実装Phase 1（Agent基盤）着手前
**現在のSprint:** Sprint 3 Phase A〜C 完了 → **Sprint 4以降は再設計に基づいて進行**

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
5. `src/lib/anthropic/` と `@anthropic-ai/sdk` は廃止 → Agent経由に置換

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
- **Latest commit:** ca7177d (Sprint 3 Phase A〜C)
- **Status:** REDESIGN.md追加（未コミット）

### 実装済み（Sprint 1 + Sprint 2 + Sprint 3 A-C）

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

### ファイル構成（Sprint 3 Phase C終了時点）
```
src/
├── app/
│   ├── (auth)/login/page.tsx, register/page.tsx, layout.tsx
│   ├── (main)/layout.tsx, quest/[id]/page.tsx, history/page.tsx
│   ├── api/quest/execute/route.ts          ← 廃止予定（Agent経由に置換）
│   ├── auth/callback/route.ts
│   ├── onboarding/page.tsx
│   ├── layout.tsx, page.tsx
│   └── globals.css
├── components/ui/ (Button, Card, Input, Modal, Toast, XpProgressBar)
├── features/
│   ├── auth/actions/index.ts, components/SignOutButton.tsx
│   ├── gamification/types/index.ts, components/(LevelUpModal, XpGainOverlay, DailyQuota)
│   ├── onboarding/components/, actions/
│   ├── quest/actions/, components/, hooks/useQuestExecution.ts, types/, constants/
│   └── (NEW) adventure/  ← 冒険ルート（未実装）
├── lib/
│   ├── anthropic/ (client.ts, stream.ts, templates.ts)  ← 廃止予定
│   ├── supabase/ (client.ts, server.ts, middleware.ts)   ← 再利用
│   ├── (NEW) agent/  ← Agent接続クライアント（未実装）
│   └── utils/cn.ts
├── stores/ (userStore.ts, questStore.ts, uiStore.ts)
├── types/ (index.ts, database.ts)
└── middleware.ts
```

### 接続状況
- Supabase: ローカル開発環境で接続済み（`supabase start`で起動）
- Anthropic API: 廃止予定（Agent経由に置換）
- Quest Agent: 未実装

---

## 再利用判定

### そのまま再利用
- `src/app/(auth)/` — 認証フロー
- `src/features/auth/` — 認証アクション・コンポーネント
- `src/features/onboarding/` — オンボーディング
- `src/features/gamification/` — XP、レベル、演出（拡張必要）
- `src/components/ui/` — UIコンポーネント全般
- `src/stores/` — Zustandストア（拡張必要）
- `src/lib/supabase/` — Supabaseクライアント・認証
- `src/middleware.ts` — 認証ミドルウェア
- ランディング/ホーム/履歴画面のレイアウト

### 廃止 → 新規置換
- `src/lib/anthropic/` → `src/lib/agent/`（Agent WebSocketクライアント）
- `src/app/api/quest/execute/route.ts` → Agent経由のWebSocket通信
- `src/features/quest/hooks/useQuestExecution.ts` → WebSocket版
- `@anthropic-ai/sdk` 依存 → 削除

### 新規追加
- `packages/quest-agent/` — ローカルAgent（Node.js + ws + child_process）
- `src/lib/agent/` — Agent接続クライアント
- `src/features/adventure/` — 冒険ルート
- `src/components/ui/Terminal.tsx` — ターミナル風UI
- DBマイグレーション — adventure_progress テーブル、preset_quests拡張

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

### 実装Phase 1: Agent基盤（最優先）
1. [ ] `packages/quest-agent/` — Quest Agent実装（WebSocketサーバー + child_process.spawn）
2. [ ] `src/lib/agent/` — PWA側Agent接続クライアント
3. [ ] `src/features/quest/hooks/useAgentConnection.ts` — 接続状態管理フック
4. [ ] 既存SSE → WebSocket置き換え（useQuestExecution書き換え）
5. [ ] `@anthropic-ai/sdk` 依存削除、`src/lib/anthropic/` 廃止

### 実装Phase 2: 通常クエストのCLI化
6. [ ] 既存10クエストをCLI実行版に変換（cli_prompt_template）
7. [ ] サンドボックスディレクトリ実装
8. [ ] Agent未接続時のフォールバックUI
9. [ ] CLIインストールガイド画面

### 実装Phase 3: 冒険ルート
10. [ ] DB追加マイグレーション（adventure_progress、preset_quests拡張、users拡張）
11. [ ] 冒険ルートUI基盤
12. [ ] 第1-5章のクエスト実装
13. [ ] ターミナル風UIコンポーネント
14. [ ] 魔王戦演出

### 実装Phase 4: PWA + デプロイ
15. [ ] serwist（PWA）設定
16. [ ] Vercelデプロイ（PWA配信のみ）

---

## 既知の問題

| 問題 | 影響 | 対応 |
|------|------|------|
| middleware.ts非推奨 | ビルド警告のみ | Phase 2でproxy移行 |
| Zod v4 breaking changes | 現行動作に影響なし | このまま |
| npm audit warnings | next依存、実害なし | 定期チェック |
| Supabaseローカルのみ | 本番接続なし | Vercelデプロイ時にリモートSupabase設定 |
| Gemini CLI未インストール | `which gemini` → not found | 必要時にインストール |

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
| SSE（廃止予定） | `src/lib/anthropic/`, `src/app/api/quest/execute/route.ts` |

---

## 禁止事項（全AIに適用）

- middleware.ts の変更（Claudeに報告して判断を仰ぐ）
- RLSポリシーの変更（同上）
- dangerouslySetInnerHTML の使用
- console.log の残置
- ハードコードされたシークレット
- Anthropic API直接呼び出しの追加（Agent経由に統一）
