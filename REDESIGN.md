# Quest App — 再設計書 v1

**作成日:** 2026-02-25
**根拠:** 3者協議（Claude + GPT + Gemini）+ ユーザーフィードバック

---

## 1. 問題の本質

現行のQuest AppはAnthropic APIを直接呼び出している。これは：

- **従量課金** — ユーザーまたは運営者がAPI利用料を負担する
- **ブラウザ版ChatGPT/Claudeと機能差なし** — わざわざアプリにする意味がない
- **ターミナルCLIを活かしていない** — ユーザーが既に持っているサブスクを使えていない

## 2. あるべき姿

Quest Appは**ユーザーのローカルCLI（Claude Code, Codex CLI, Gemini CLI）のフロントエンド**。

- ユーザーの既存サブスク内で動作 → **追加課金なし**
- ターミナルを裏で動かす → ユーザーはターミナルを意識しない
- 希望者には「ターミナル（魔王）を倒す冒険ルート」を提供

## 3. アーキテクチャ

### 全体構成

```
┌─────────────────────────────┐
│    Quest App (PWA/Next.js)  │  ← ブラウザで動作
│    localhost:3000            │
└──────────┬──────────────────┘
           │ WebSocket
┌──────────▼──────────────────┐
│    Quest Agent (Node.js)    │  ← ローカルデーモン
│    localhost:3939            │
│                              │
│  ┌─────────────────────────┐│
│  │ child_process.spawn()   ││
│  │ ├── claude (Claude Code)││
│  │ ├── codex  (Codex CLI)  ││
│  │ └── gemini (Gemini CLI) ││
│  └─────────────────────────┘│
└──────────────────────────────┘
           │
           ▼
  ユーザーのローカルファイルシステム
```

### コンポーネント

| コンポーネント | 役割 | 技術 |
|----------------|------|------|
| Quest App (PWA) | UI、認証、ゲーミフィケーション、クエスト管理 | Next.js 16, React 19, Supabase, Zustand |
| Quest Agent | CLI実行、ファイル操作、進捗報告 | Node.js, ws, child_process |
| CLI Tools | AI処理の実体 | claude, codex, gemini（ユーザーのサブスク） |

### 通信フロー

```
1. ユーザーがクエストを選択・入力を送信
2. PWA → WebSocket → Quest Agent にコマンド送信
3. Agent が child_process.spawn() でCLI実行
4. CLIの stdout/stderr を WebSocket経由でリアルタイム送信
5. PWA側でストリーミング表示（ターミナル出力は平易な日本語に変換）
6. 完了 → XP付与、結果表示
```

## 4. Quest Agentの仕様

### 起動

```bash
npx quest-agent start
# または
npm install -g @quest-app/agent
quest-agent start
```

- デフォルト: `ws://localhost:3939`
- 認証: PWAとの間でワンタイムトークン（初回ペアリング時に生成）
- 自動検出: PWAが `ws://localhost:3939/health` をポーリングして接続状態を表示

### セキュリティモデル

| レベル | 制約 | 例 |
|--------|------|----|
| Safe (Lv.1-2) | ホワイトリストコマンドのみ | ファイル読み取り、テキスト生成、翻訳 |
| Guarded (Lv.3-5) | 承認ダイアログ付き | ファイル書き込み、npm install |
| Advanced (Lv.6+) | ユーザー承認 + Undo可能 | git操作、ディレクトリ作成 |
| Boss (冒険ルート最終) | 完全自由（ターミナル直接操作） | ターミナル克服 = ゲームクリア |

### コマンドホワイトリスト（クエスト定義に含む）

```typescript
interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  category: QuestCategory;
  xp_reward: number;
  // NEW: CLI実行仕様
  cli_tool: 'claude' | 'codex' | 'gemini';
  cli_prompt_template: string;  // CLIに渡すプロンプト
  allowed_commands: string[];   // ホワイトリスト
  working_directory: 'sandbox' | 'user_specified';
  requires_approval: boolean;
  max_execution_time: number;   // 秒
}
```

## 5. 二層構造のクエスト設計

### 通常クエスト（CLI裏実行）

ユーザーはターミナルを一切見ない。CLIは裏で動き、結果だけ表示される。

| クエスト | CLI | やること | ユーザー体験 |
|----------|-----|---------|-------------|
| 自己紹介文を作って | claude | テキスト生成 | 入力 → 結果表示 |
| メールの下書き | claude | テキスト生成 | 入力 → 結果表示 |
| この写真を説明して | claude | 画像分析 | 画像アップ → 説明文 |
| Webサイトを要約して | claude | URL読み取り+要約 | URL入力 → 要約表示 |
| プレゼン資料の骨子 | codex | ファイル生成 | テーマ入力 → Markdown/PDF |
| 簡単なWebページ作成 | codex | HTML生成 | 要件入力 → プレビュー表示 |

### 冒険ルート（ターミナル克服の旅）

段階的にターミナル操作を学ぶ。最終的にターミナルを自分で使えるようになる = **魔王を倒す = ゲームクリア**。

#### ストーリー構成

```
第1章: 旅立ちの村（Lv.1-2）
  → AIが全部やってくれる。ユーザーは「お願い」するだけ
  → ターミナルの存在を知る程度

第2章: 森の試練（Lv.3-4）
  → 簡単なコマンドを1つずつ実行（ls, cd, cat）
  → AIが横でガイドしてくれる

第3章: 山岳の修行（Lv.5-6）
  → ファイル操作（mkdir, cp, mv, touch）
  → gitの基本（init, add, commit）
  → AIの補助が減っていく

第4章: 魔王城への道（Lv.7-8）
  → npm/pip等のパッケージ管理
  → 簡単なスクリプト実行
  → エラーを自分で読み解く

第5章: 魔王戦 — ターミナルとの対決（Lv.9-10）
  → CLIツールを自分でインストール・設定
  → Claude Code / Codex CLIを自分で使う
  → ターミナルで自由に作業できる = クリア
```

#### 冒険クエストの例

| 章 | クエスト名 | 実際の操作 | 演出 |
|----|-----------|-----------|------|
| 1 | 「最初のお願い」 | AIにテキスト生成を依頼（裏実行） | マスコットが代わりにやってくれる |
| 2 | 「森の地図を読め」 | `ls` でファイル一覧を見る | 「この森にどんな木があるか見てみよう」 |
| 2 | 「宝箱を開けろ」 | `cat` でファイルの中身を見る | 「宝箱の中身は…？」 |
| 3 | 「拠点を作れ」 | `mkdir` でディレクトリ作成 | 「冒険の拠点を建設しよう」 |
| 3 | 「冒険の記録」 | `git init` + `git add` + `git commit` | 「冒険日記をつけよう」 |
| 4 | 「武器を鍛えろ」 | `npm install` でパッケージ追加 | 「新しい武器を手に入れた！」 |
| 5 | 「魔王に挑め」 | ターミナルで自由に作業 | 「ついに…ターミナルを制した！」 |

## 6. 既存コードの再利用判定

### 再利用可能（そのまま）

| ファイル/モジュール | 理由 |
|---------------------|------|
| `src/app/(auth)/` | 認証フローは変わらない |
| `src/features/auth/` | 認証アクション・コンポーネント |
| `src/features/onboarding/` | オンボーディングフロー |
| `src/features/gamification/` | XP、レベル、演出（拡張は必要） |
| `src/components/ui/` | UIコンポーネント全般 |
| `src/stores/` | Zustandストア（拡張は必要） |
| `src/lib/supabase/` | Supabaseクライアント・認証 |
| `src/types/index.ts` | 型定義（拡張は必要） |
| `src/middleware.ts` | 認証ミドルウェア |
| `supabase/migrations/` | DBスキーマ（マイグレーション追加は必要） |
| ランディングページ、ホーム画面、履歴画面 | レイアウト・構成はそのまま |

### 置き換え（削除 → 新規）

| ファイル/モジュール | 理由 |
|---------------------|------|
| `src/lib/anthropic/` | API直接呼び出し → Agent経由に変更 |
| `src/app/api/quest/execute/route.ts` | Anthropic SSE → Agent WebSocket に変更 |
| `src/features/quest/hooks/useQuestExecution.ts` | SSE → WebSocket に変更 |
| `package.json` の `@anthropic-ai/sdk` | 不要になる |

### 新規追加

| モジュール | 内容 |
|-----------|------|
| `packages/quest-agent/` | ローカルAgent（別パッケージ） |
| `src/lib/agent/` | Agent接続クライアント（WebSocket） |
| `src/features/quest/hooks/useAgentConnection.ts` | Agent接続状態管理 |
| `src/features/adventure/` | 冒険ルート（章・クエスト・進捗） |
| `src/components/ui/Terminal.tsx` | 冒険ルート用のターミナル風UI |
| DBマイグレーション | adventure_progress テーブル追加 |

## 7. DB変更（追加マイグレーション）

```sql
-- preset_quests に CLI実行関連カラム追加
ALTER TABLE preset_quests ADD COLUMN cli_tool TEXT DEFAULT 'claude';
ALTER TABLE preset_quests ADD COLUMN cli_prompt_template TEXT;
ALTER TABLE preset_quests ADD COLUMN allowed_commands JSONB DEFAULT '[]';
ALTER TABLE preset_quests ADD COLUMN working_directory TEXT DEFAULT 'sandbox';
ALTER TABLE preset_quests ADD COLUMN requires_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE preset_quests ADD COLUMN max_execution_time INTEGER DEFAULT 60;

-- 冒険ルート進捗テーブル
CREATE TABLE adventure_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL DEFAULT 1,
  quest_identifier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'completed')),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, quest_identifier)
);

ALTER TABLE adventure_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "adventure_select_own" ON adventure_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "adventure_insert_own" ON adventure_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "adventure_update_own" ON adventure_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- users テーブル拡張
ALTER TABLE users ADD COLUMN adventure_chapter INTEGER DEFAULT 0;
ALTER TABLE users ALTER COLUMN level DROP CONSTRAINT IF EXISTS users_level_check;
ALTER TABLE users ADD CONSTRAINT users_level_check CHECK (level BETWEEN 1 AND 10);
```

## 8. ゲーミフィケーション拡張

### レベル上限の引き上げ

```
現行: Lv.1-3（XP: 0, 50, 200）
新規: Lv.1-10

Lv.1:  0 XP    — 基本クエスト
Lv.2:  50 XP   — 基本クエスト
Lv.3:  200 XP  — ビジネス・生活クエスト解放
Lv.4:  500 XP  — 冒険ルート解放（第2章）
Lv.5:  1000 XP — クリエイティブ・分析クエスト解放
Lv.6:  2000 XP — 冒険ルート第3章
Lv.7:  3500 XP — 冒険ルート第4章
Lv.8:  5500 XP — 上級クエスト解放
Lv.9:  8000 XP — 冒険ルート第5章（魔王戦）
Lv.10: 12000 XP — ターミナルマスター（ゲームクリア）
```

### 冒険ルートは任意

- 通常クエストだけでもLv.10まで到達可能
- 冒険ルートはLv.4以降で選択肢として表示
- 冒険クエストは通常クエストより多くのXPを獲得
- 魔王を倒さなくてもペナルティなし

## 9. 実装フェーズ

### Phase 1: Agent基盤（Sprint 5）

1. Quest Agentの実装（`packages/quest-agent/`）
   - WebSocketサーバー
   - child_process.spawn() によるCLI実行
   - stdout/stderrのリアルタイム転送
   - ヘルスチェックエンドポイント
2. PWA側のAgent接続クライアント
   - `useAgentConnection` フック
   - 接続状態UI（接続中/未接続/エラー）
3. 既存SSE → WebSocket置き換え
   - `/api/quest/execute` を Agent経由に変更
   - `useQuestExecution` を WebSocket版に書き換え
4. `@anthropic-ai/sdk` 依存を削除

### Phase 2: 通常クエストのCLI化（Sprint 6）

1. 既存10クエストをCLI実行版に変換
   - prompt_template → cli_prompt_template
   - Anthropic API呼び出し → `claude` CLI呼び出し
2. サンドボックスディレクトリの実装
3. Agent接続なし時のフォールバック表示
4. CLIインストールガイド画面

### Phase 3: 冒険ルート（Sprint 7-8）

1. 冒険ルートのDB/UI基盤
2. 第1-2章のクエスト実装
3. ターミナル風UIコンポーネント
4. 第3-5章のクエスト実装
5. 魔王戦演出

### Phase 4: PWA + デプロイ（Sprint 9）

1. serwist（PWA）設定
2. オフライン対応（Agent未接続時のUI）
3. Vercelデプロイ（PWA配信のみ、Agent接続はローカル）

## 10. 前提条件

- ユーザーのPCにCLIツール（claude, codex, gemini のいずれか）がインストール済み
- ユーザーが各CLIのサブスクリプションを持っている
- Quest Agentをローカルで起動できる

CLIが未インストールの場合は、インストールガイドを表示する。これ自体を冒険ルートの最初のクエストにすることもできる。

---

## 11. Moshi/リモート対応

ユーザーはMoshiアプリ（iPhone）→ Tailscale VPN → Mac → SSH でリモートCLI操作が可能。

Quest Agent がMacで常時起動していれば、Moshi経由でもQuest App PWAにアクセスできる。将来的に Cloudflare Tunnel 経由で外出先からもPWA接続可能。

---

## まとめ

| 項目 | 現行 | 新設計 |
|------|------|--------|
| AI実行 | Anthropic API直接 | ローカルCLI経由 |
| コスト | 従量課金 | ユーザーの既存サブスク |
| 差別化 | ブラウザChatBotと同じ | ターミナルの親しみやすいフロントエンド |
| ゴール | テキスト生成 | ターミナル習得（魔王を倒す） |
| レベル上限 | Lv.3 | Lv.10 |
| ターゲット | 非エンジニア | 非エンジニア（ターミナルに恐怖感がある人） |
