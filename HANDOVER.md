# Quest App - HANDOVER

**最終更新:** 2026-02-25
**現在のPhase:** Phase 5（RPG化リデザイン）— **UI全面改修完了、DB seed未適用**
**現在のSprint:** Sprint 10 Phase 5 RPG化リデザイン

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
- **Latest commit:** 41d8aab fix: 第0章マイグレーションにchapter制約変更を追加
- **Status:** クリーン（コミット済み・プッシュ済み）
- **Production URL:** https://quest-app-eight.vercel.app
- **Supabase Remote:** yabrrdonqlttzwrfpqdu (Northeast Asia / Tokyo)

### Phase 5 で変更したもの（RPG化リデザイン）

#### 削除
- `src/features/gamification/components/DailyQuota.tsx` — 旧API時代の残骸、CLI経由では無意味
- `getDailyQuota()` 関数（`src/features/quest/actions/index.ts`）
- `page.tsx` の DailyQuota インポート・表示

#### 全面改修
- `src/app/globals.css` — ダークRPGテーマ（`#0f172a`）、RPGアニメーション12種追加
- `src/app/page.tsx` — ギルド掲示板レイアウト + RPGランディング
- `src/app/(main)/layout.tsx` — ゲームメニューナビ（冒険の記録/冒険に出る/装備）
- `src/app/(main)/adventure/page.tsx` — ワールドマップ風レイアウト
- `src/app/(main)/adventure/[chapter]/[questId]/page.tsx` — 第0章分岐追加
- `src/features/quest/components/QuestCard.tsx` — 依頼書風デザイン
- `src/features/quest/constants/category.ts` — RPG風カテゴリ名
- `src/features/adventure/types/index.ts` — 第0章追加
- `src/features/onboarding/components/StepComplete.tsx` — 遷移先を第0章に変更
- `src/features/setup/components/CliSetupGuide.tsx` — useCliDetection フック使用に変更

#### 新規ファイル
| ファイル | 説明 |
|---------|------|
| `src/components/ui/StatusBar.tsx` | RPG風ステータスバー（Lv + XP + ユーザー名） |
| `src/components/ui/GameNav.tsx` | モバイル底部固定ゲームメニュー |
| `src/features/adventure/components/WorldMap.tsx` | ワールドマップレイアウト（縦拠点連結） |
| `src/features/adventure/components/SetupChapterRunner.tsx` | 第0章ルーティング用クライアントラッパー |
| `src/features/adventure/components/SetupQuestWeaponCheck.tsx` | 第0章: CLI検出（武器確認） |
| `src/features/adventure/components/SetupQuestWeaponForge.tsx` | 第0章: インストールガイド（鍛冶屋） |
| `src/features/adventure/components/SetupQuestSummonAlly.tsx` | 第0章: Agent起動（仲間召喚） |
| `src/features/setup/hooks/useCliDetection.ts` | CLI検出ロジック共通フック |
| `supabase/migrations/00004_phase5_setup_adventure.sql` | 第0章シードデータ（3クエスト） |

### 実装済み（Phase 1-4）

#### Sprint 1-2（完了）
プロジェクト初期化、認証、UIコンポーネント、Supabase接続、オンボーディング、クエスト実行MVP

#### Sprint 3（完了）
XPプログレスバー、履歴画面、レベルアップ演出、デイリークォータ

#### Sprint 5-6（完了）
Quest Agent基盤、通常クエストCLI化、サンドボックス、CLIインストールガイド

#### Sprint 7（完了）
冒険ルート全14種シードデータ、Terminal.tsx、StoryDialog、AdventureQuestRunner、BossVictory

#### Sprint 9（完了）
PWA設定、E2E検証、UI/アニメーション改善、Vercelデプロイ、Supabaseリモート

---

## 完了タスク（2026-02-26）

### 1. Supabaseリモートに第0章マイグレーション適用 ✅
- `adventure_chapter` CHECK制約を `BETWEEN 1 AND 5` → `BETWEEN 0 AND 5` に変更
- 第0章の3クエスト（武器確認・武器鍛造・仲間召喚）をリモートDBに投入済み
- マイグレーションファイルも制約変更を含むように更新・コミット済み

### 2. 本番環境UI確認 ✅
- ダークRPGテーマ正常表示
- ランディングページ、ログイン画面確認済み
- manifest.webmanifest Syntax Error（serwist既知問題）

### 3. 冒険入口Lv.4+問題 → 問題なしと判定 ✅
- ホーム画面CTA、GameNav、ナビリンクすべてレベル制限なし
- 第0章・第1章はLv.1で解放済み
- 第2章以降の段階ロックは設計通り

### 4. .env.local をリモートSupabase向けに更新 ✅
- NEXT_PUBLIC_SUPABASE_URL → `https://yabrrdonqlttzwrfpqdu.supabase.co`
- ANON_KEY / SERVICE_ROLE_KEY → リモートプロジェクトのキーに変更

---

## 次のタスク

### Phase 5 残り候補
- [ ] Vercel環境変数にリモートSupabaseキーを設定（本番DBとの接続）
- [ ] Google認証プロバイダ設定（Supabase + Google Cloud Console）
- [ ] オンボーディング → 第0章 → ホームのE2Eフロー確認
- [ ] カスタムドメイン設定
- [ ] Upstash Redis（レート制限）
- [ ] Stripe課金連携
- [ ] カスタムクエスト作成機能

---

## ファイル構成（Phase 5時点）
```
quest-app/
├── packages/
│   └── quest-agent/                    — ローカルAgent（WebSocket + child_process.spawn）
├── src/
│   ├── app/
│   │   ├── (auth)/login, register
│   │   ├── (main)/
│   │   │   ├── layout.tsx             — ゲームメニューナビ + StatusBar + GameNav
│   │   │   ├── quest/[id]/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── setup/page.tsx         — 装備（CLIセットアップ独立ページ）
│   │   │   └── adventure/
│   │   │       ├── page.tsx           — ワールドマップ
│   │   │       └── [chapter]/[questId]/page.tsx — 第0章分岐対応
│   │   ├── onboarding/page.tsx
│   │   ├── page.tsx                   — ギルド掲示板 + RPGランディング
│   │   ├── globals.css                — ダークRPGテーマ + RPGアニメーション
│   │   ├── manifest.ts, sw.ts
│   │   └── layout.tsx
│   ├── components/ui/
│   │   ├── StatusBar.tsx              ← NEW Phase 5
│   │   ├── GameNav.tsx                ← NEW Phase 5
│   │   └── (既存: Button, Card, Terminal, NavLink, etc.)
│   ├── features/
│   │   ├── adventure/
│   │   │   ├── components/
│   │   │   │   ├── WorldMap.tsx           ← NEW Phase 5
│   │   │   │   ├── SetupChapterRunner.tsx ← NEW Phase 5
│   │   │   │   ├── SetupQuestWeaponCheck.tsx ← NEW Phase 5
│   │   │   │   ├── SetupQuestWeaponForge.tsx ← NEW Phase 5
│   │   │   │   ├── SetupQuestSummonAlly.tsx  ← NEW Phase 5
│   │   │   │   └── (既存: ChapterCard, StoryDialog, AdventureQuestRunner, etc.)
│   │   │   ├── actions/index.ts
│   │   │   └── types/index.ts         — 第0章追加
│   │   ├── setup/
│   │   │   ├── components/CliSetupGuide.tsx — useCliDetection使用に変更
│   │   │   └── hooks/useCliDetection.ts    ← NEW Phase 5
│   │   ├── quest/
│   │   │   ├── components/QuestCard.tsx    — 依頼書風リデザイン
│   │   │   └── constants/category.ts      — RPG風カテゴリ名
│   │   ├── gamification/
│   │   │   └── components/
│   │   │       ├── LevelUpModal.tsx
│   │   │       └── XpGainOverlay.tsx
│   │   │       (DailyQuota.tsx は削除)
│   │   └── onboarding/
│   │       └── components/StepComplete.tsx — 遷移先を第0章に変更
│   └── (lib/, stores/, types/, hooks/)
├── supabase/
│   └── migrations/
│       ├── 00001_initial_schema.sql
│       ├── 00002_phase2_cli_columns.sql
│       ├── 00003_phase3_adventure.sql
│       └── 00004_phase5_setup_adventure.sql  ← Phase 5（適用済み 2026-02-26）
├── vercel.json
└── next.config.ts
```

---

## 既知の問題

| 問題 | 影響 | 対応 |
|------|------|------|
| middleware.ts非推奨 | ビルド警告のみ | Phase 5+でproxy移行 |
| 00004マイグレーション | **適用済み**（2026-02-26） | 制約変更+データ投入完了 |
| Vercel環境変数未設定 | 本番がリモートDB未接続の可能性 | Vercelダッシュボードで設定 |
| serwist Turbopack非互換 | --webpack必須 | @serwist/turbopack移行検討 |
| Gemini CLI未インストール | `which gemini` → not found | 必要時にインストール |

---

## 高リスク領域の参照ファイル一覧

| 領域 | ファイル |
|------|---------|
| 再設計書 | `REDESIGN.md` |
| DB Schema | `supabase/migrations/00001_initial_schema.sql` |
| Phase 2 Migration | `supabase/migrations/00002_phase2_cli_columns.sql` |
| Phase 3 Migration | `supabase/migrations/00003_phase3_adventure.sql` |
| Phase 5 Migration | `supabase/migrations/00004_phase5_setup_adventure.sql` |
| RLS Policy | `00001_initial_schema.sql` + `00003_phase3_adventure.sql` |
| Auth Actions | `src/features/auth/actions/index.ts` |
| Auth Callback | `src/app/auth/callback/route.ts` |
| Middleware | `src/lib/supabase/middleware.ts` |
| Quest Schemas | `src/features/quest/types/schema.ts` |
| Gamification | `src/features/gamification/types/index.ts` |
| Agent Server | `packages/quest-agent/src/server.ts` |
| Agent Client | `src/lib/agent/client.ts` |
| Agent Hooks | `src/features/quest/hooks/useAgentConnection.ts`, `useQuestExecution.ts` |
| XP Server Action | `src/features/quest/actions/complete-quest.ts` |
| Adventure Actions | `src/features/adventure/actions/index.ts` |
| Adventure Types | `src/features/adventure/types/index.ts` |
| Setup Chapter | `src/features/adventure/components/SetupChapterRunner.tsx` |
| CLI Detection | `src/features/setup/hooks/useCliDetection.ts` |
| PWA Config | `next.config.ts`, `src/app/sw.ts`, `src/app/manifest.ts` |
| Vercel Config | `vercel.json` |

---

## 禁止事項（全AIに適用）

- middleware.ts の変更（Claudeに報告して判断を仰ぐ）
- RLSポリシーの変更（同上）
- dangerouslySetInnerHTML の使用
- console.log の残置
- ハードコードされたシークレット
- Anthropic API直接呼び出しの追加（Agent経由に統一）
