-- Phase 2: CLI columns for preset_quests + Level expansion

-- preset_quests に CLI実行関連カラム追加
ALTER TABLE preset_quests ADD COLUMN cli_tool TEXT DEFAULT 'claude';
ALTER TABLE preset_quests ADD COLUMN cli_prompt_template TEXT;
ALTER TABLE preset_quests ADD COLUMN allowed_commands JSONB DEFAULT '[]';
ALTER TABLE preset_quests ADD COLUMN working_directory TEXT DEFAULT 'sandbox';
ALTER TABLE preset_quests ADD COLUMN requires_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE preset_quests ADD COLUMN max_execution_time INTEGER DEFAULT 60;

-- users テーブル: レベル上限を3→10に拡張
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_level_check;
ALTER TABLE users ADD CONSTRAINT users_level_check CHECK (level BETWEEN 1 AND 10);
