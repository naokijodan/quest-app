# Task Definition Template

## Usage
Claudeがタスク定義を `codex/current-task.txt` に作成する際のテンプレート。
Codex CLI / Gemini CLI がこのファイルを読み取り、コードを生成する。

---

```markdown
# Task: [Sprint]-[Feature Name]
# AI: [Codex CLI / Gemini CLI]
# Priority: [High / Medium / Low]
# Risk Level: [Critical / High / Medium / Low]

## 1. Objective（目的）
[何を実現するか。1-2文で明確に。]

## 2. Target Files（対象ファイル）
### Create（新規作成）
- src/features/{feature}/components/{ComponentName}.tsx
- src/features/{feature}/actions/{actionName}.ts

### Modify（変更）
- src/app/(main)/page.tsx (該当行のみ)

## 3. Dependencies（依存ファイル — 必ず読むこと）
- src/components/ui/index.ts（共通UIコンポーネント）
- src/types/index.ts（型定義）
- src/lib/supabase/server.ts（Supabaseサーバークライアント）

## 4. Requirements（仕様）
- [具体的な機能要件を箇条書き]
- [UIの振る舞い、データフロー、エラーケース]

## 5. Constraints（制約 — 必ず守ること）
- TailwindCSS 4のみ使用（CSS Modules禁止）
- Server Actions使用（API Routeは /api/quest/execute のみ許可）
- Zod v4でサーバーサイドバリデーション
- 型定義は src/types/index.ts の既存型を使用
- immutableパターン（state mutation禁止）
- ファイルは200-400行、最大800行

## 6. Forbidden（禁止事項）
- [ ] dangerouslySetInnerHTML の使用
- [ ] console.log の残置
- [ ] ハードコードされたシークレット
- [ ] 既存のRLSポリシーの変更（変更が必要な場合はClaudeに報告）
- [ ] middleware.ts の変更（変更が必要な場合はClaudeに報告）

## 7. High-Risk Area Details（高リスク領域 — 該当する場合のみ）

### SSE Streaming
- Endpoint: /api/quest/execute
- Event format: { type: 'start'|'delta'|'progress'|'complete'|'error', ... }
- 参照実装: src/types/index.ts の QuestSSEEvent 型
- 不変条件: SSEイベントは必ず上記の型に従う
- エラー時: partial_output を保存、status を 'failed' に更新

### Supabase RLS
- 全テーブルにRLS有効
- users/quest_runs/user_daily_quotas: auth.uid() = user_id
- preset_quests: is_active = TRUE で全員読み取り可
- 参照: supabase/migrations/00001_initial_schema.sql

### Authentication
- Google OAuth / Email+Password / Magic Link
- 参照実装: src/features/auth/actions/index.ts
- コールバック: src/app/auth/callback/route.ts
- ミドルウェア: src/lib/supabase/middleware.ts

## 8. Acceptance Criteria（受け入れ基準）
- [ ] TypeScript型エラーなし（npm run build 成功）
- [ ] 既存のテストが壊れない
- [ ] 新規機能のユニットテスト追加
- [ ] [機能固有のテスト基準]

## 9. Reference Code（参照コード片 — 必要に応じて）
```typescript
// 既存パターンの例をここに貼り付け
```
```

---

## Risk Level Guide

| Level | 定義 | 追加ルール |
|-------|------|-----------|
| Critical | SSE/RLS/認証/課金に直接関わる | Codex実装 + Geminiレビュー必須 |
| High | DB操作・外部API連携 | タスク定義に参照実装を必ず含める |
| Medium | 新画面・新コンポーネント | 標準テンプレートで十分 |
| Low | スタイル修正・テキスト変更 | 最小限のタスク定義でOK |
