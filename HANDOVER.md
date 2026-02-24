# Quest App - HANDOVER

**最終更新:** 2026-02-25
**現在のPhase:** Phase 1 - MVP
**現在のSprint:** Sprint 2 着手前

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
- **Latest commit:** `fd476d7` docs: 3者協議に基づくCLAUDE.md更新
- **Status:** Clean, up to date with origin/main

### 実装済み（24ファイル）
Sprint 1完了: プロジェクト初期化、認証、UIコンポーネント、ミドルウェア
詳細は CLAUDE.md の Directory Structure 参照

### 未接続
- Supabase: `.env.local` 未設定（プロジェクト作成が必要）
- Anthropic API: Sprint 2 Phase C で接続
- Upstash Redis: Sprint 3 で接続

---

## コンテキスト管理ルール

### 引き継ぎタイミング
- **残り30%** で開発停止 → 引き継ぎ作業へ
- **引き継ぎ作業に15-20%** の余力を確保
- **SSE/RLS/認証タスクは途中切断禁止**（機能の区切りで引き継ぎ）

### 引き継ぎ時の必須アクション
1. HANDOVER.md 更新（現在の状態、未解決課題、次タスク）
2. git commit & push
3. Obsidianノート作成
4. Discord通知
5. 「次セッション指示文」を出力

---

## 次のタスク

### Sprint 2 Phase A: Supabase接続（最優先）
- [ ] Supabaseプロジェクト作成（https://supabase.com/dashboard）
- [ ] `.env.local` に URL/Anon Key/Service Role Key 設定
- [ ] DBマイグレーション適用
- [ ] シードデータ投入
- [ ] 認証フロー動作確認

### Sprint 2 Phase B: 最小オンボーディング
- [ ] オンボーディング画面（3ステップ: 名前→アバター→マスコット）
- [ ] オンボーディング完了 Server Action
- [ ] 「最初のクエスト」として演出

### Sprint 2 Phase C: クエスト実行（MVP核心）
- [ ] Anthropic SDK初期化
- [ ] SSEストリーミング API Route
- [ ] クエスト詳細画面
- [ ] 実行中画面（マスコット演出）
- [ ] 結果表示画面
- [ ] エラーハンドリング + リトライ

---

## 既知の問題

| 問題 | 影響 | 対応 |
|------|------|------|
| middleware.ts非推奨 | ビルド警告のみ | Phase 2でproxy移行 |
| Zod v4 breaking changes | 現行動作に影響なし | このまま |
| npm audit warnings | next依存、実害なし | 定期チェック |

---

## 高リスク領域の参照ファイル一覧（変更時は必ず確認）

| 領域 | ファイル |
|------|---------|
| SSE型定義 | `src/types/index.ts` (QuestSSEEvent) |
| DB Schema | `supabase/migrations/00001_initial_schema.sql` |
| RLS Policy | 同上（CREATE POLICY セクション） |
| Auth Actions | `src/features/auth/actions/index.ts` |
| Auth Callback | `src/app/auth/callback/route.ts` |
| Middleware | `src/lib/supabase/middleware.ts` |
| Supabase Client | `src/lib/supabase/client.ts`, `server.ts` |
| Quest Schemas | `src/features/quest/types/schema.ts` |
| Gamification | `src/features/gamification/types/index.ts` |

---

## 禁止事項（全AIに適用）

- middleware.ts の変更（Claudeに報告して判断を仰ぐ）
- RLSポリシーの変更（同上）
- dangerouslySetInnerHTML の使用
- console.log の残置
- ハードコードされたシークレット
- 新しいAPI Routeの作成（/api/quest/execute 以外）
