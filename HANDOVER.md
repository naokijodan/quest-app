# Quest App - HANDOVER

**最終更新:** 2026-02-25
**現在のPhase:** Phase 2完了 + Phase 3（冒険ルート）完了 → Phase 4（PWA + デプロイ）着手
**現在のSprint:** Sprint 7 Phase 3 冒険ルート完了

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
- **Latest commit:** ed16301 Phase 3 冒険ルート実装
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
2. [x] 冒険クエスト全14種のシードデータ（第1-5章）
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

### ファイル構成（Phase 3完了時点）
```
quest-app/
├── packages/
│   └── quest-agent/
│       ├── src/
│       │   ├── index.ts
│       │   ├── server.ts
│       │   ├── executor.ts            — per-request sandbox対応
│       │   ├── types.ts               — sandbox_files追加
│       │   ├── security.ts            — createRequestSandbox, cleanup追加
│       │   ├── health.ts
│       │   └── auth.ts
│       ├── package.json
│       └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx, register/page.tsx, layout.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx             — 冒険・セットアップナビ追加
│   │   │   ├── quest/[id]/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── setup/page.tsx         ← NEW: CLIセットアップガイド
│   │   │   └── adventure/             ← NEW: 冒険ルート
│   │   │       ├── page.tsx           — チャプター選択
│   │   │       └── [chapter]/[questId]/page.tsx — クエスト実行
│   │   ├── api/
│   │   ├── auth/callback/route.ts
│   │   ├── onboarding/page.tsx
│   │   ├── layout.tsx, page.tsx       — 冒険ルート入口追加
│   │   └── globals.css
│   ├── components/ui/
│   │   ├── Button, Card, Input, Modal, Toast, XpProgressBar
│   │   └── Terminal.tsx               ← NEW: ターミナル風UI
│   ├── features/
│   │   ├── auth/
│   │   ├── gamification/
│   │   ├── onboarding/
│   │   ├── quest/
│   │   ├── setup/                     ← NEW: CLIセットアップ
│   │   │   └── components/CliSetupGuide.tsx
│   │   └── adventure/                 ← NEW: 冒険ルート
│   │       ├── types/index.ts
│   │       ├── actions/index.ts
│   │       └── components/
│   │           ├── ChapterCard.tsx
│   │           ├── AdventureQuestCard.tsx
│   │           ├── StoryDialog.tsx
│   │           ├── AdventureQuestRunner.tsx
│   │           ├── BossVictory.tsx
│   │           └── AdventureChapterComplete.tsx
│   ├── lib/
│   │   ├── agent/
│   │   ├── supabase/
│   │   └── utils/
│   ├── stores/
│   ├── types/index.ts                 — AdventureProgress, QuestType追加
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_phase2_cli_columns.sql
│   │   └── 00003_phase3_adventure.sql ← NEW
│   ├── seed.sql
│   └── seed_phase3_adventure.sql      ← NEW
└── codex/
```

### 接続状況
- Supabase: ローカル開発環境で接続済み（`supabase start`で起動）
- Anthropic API: **廃止済み**
- Quest Agent: **実装完了**（`cd packages/quest-agent && npm run dev` で起動）

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

### 実装Phase 4: PWA + デプロイ
1. [ ] serwist（PWA）設定
2. [ ] オフライン対応（Agent未接続時のUI改善）
3. [ ] Vercelデプロイ（PWA配信のみ）
4. [ ] Supabaseリモート接続設定

### 改善候補（Phase 4と並行可能）
- [ ] 冒険クエストの動作検証（Supabaseにシードデータ投入 → 実際のCLI実行テスト）
- [ ] E2Eテスト（Playwright: オンボーディング → クエスト → 冒険ルート）
- [ ] 冒険ルートのチャプター一覧UI改善（各クエストの進捗表示）

---

## 既知の問題

| 問題 | 影響 | 対応 |
|------|------|------|
| middleware.ts非推奨 | ビルド警告のみ | Phase 4でproxy移行 |
| Zod v4 breaking changes | 現行動作に影響なし | このまま |
| npm audit warnings | next依存、実害なし | 定期チェック |
| Supabaseローカルのみ | 本番接続なし | Vercelデプロイ時にリモートSupabase設定 |
| Gemini CLI未インストール | `which gemini` → not found | 必要時にインストール |
| Phase 3のシードデータ未投入 | 冒険クエスト動作確認不可 | `supabase db push` + seed実行 |
| BossVictory.tsx uses style jsx | Next.js styled-jsx設定必要かも | 要確認 |

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

---

## 禁止事項（全AIに適用）

- middleware.ts の変更（Claudeに報告して判断を仰ぐ）
- RLSポリシーの変更（同上）
- dangerouslySetInnerHTML の使用
- console.log の残置
- ハードコードされたシークレット
- Anthropic API直接呼び出しの追加（Agent経由に統一）
