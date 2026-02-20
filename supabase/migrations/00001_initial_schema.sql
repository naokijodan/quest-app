-- ================================
-- Quest App - Initial Schema
-- Phase 1: MVP
-- ================================

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- users
-- ================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_type TEXT NOT NULL DEFAULT 'planner'
    CHECK (avatar_type IN ('planner', 'explorer', 'crafter')),
  mascot_type TEXT NOT NULL DEFAULT 'cat'
    CHECK (mascot_type IN ('cat', 'dog')),
  experience_points INTEGER NOT NULL DEFAULT 0
    CHECK (experience_points >= 0),
  level INTEGER NOT NULL DEFAULT 1
    CHECK (level BETWEEN 1 AND 3),
  unlocked_categories JSONB NOT NULL DEFAULT '["basic"]',
  quest_count INTEGER NOT NULL DEFAULT 0
    CHECK (quest_count >= 0),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================
-- preset_quests
-- ================================
CREATE TABLE preset_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_identifier TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  difficulty INTEGER NOT NULL DEFAULT 1
    CHECK (difficulty BETWEEN 1 AND 3),
  category TEXT NOT NULL DEFAULT 'basic'
    CHECK (category IN ('basic', 'business', 'life', 'creative', 'analysis')),
  xp_reward INTEGER NOT NULL DEFAULT 10
    CHECK (xp_reward > 0),
  prompt_template TEXT NOT NULL,
  output_type TEXT NOT NULL DEFAULT 'markdown'
    CHECK (output_type IN ('markdown', 'json', 'text', 'csv')),
  required_inputs JSONB NOT NULL DEFAULT '[]',
  max_tokens_limit INTEGER NOT NULL DEFAULT 1000
    CHECK (max_tokens_limit BETWEEN 100 AND 4000),
  icon TEXT NOT NULL DEFAULT '📝',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  version INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE preset_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preset_quests_select_all" ON preset_quests
  FOR SELECT USING (is_active = TRUE);

CREATE INDEX idx_preset_quests_category ON preset_quests(category);
CREATE INDEX idx_preset_quests_difficulty ON preset_quests(difficulty);
CREATE INDEX idx_preset_quests_sort ON preset_quests(sort_order);

CREATE TRIGGER preset_quests_updated_at
  BEFORE UPDATE ON preset_quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================
-- quest_runs
-- ================================
CREATE TABLE quest_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preset_quest_id UUID REFERENCES preset_quests(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data JSONB NOT NULL DEFAULT '{}',
  partial_output TEXT,
  output_data TEXT,
  output_type TEXT NOT NULL DEFAULT 'markdown',
  actual_tokens_used INTEGER,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0
    CHECK (retry_count >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE quest_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quest_runs_select_own" ON quest_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quest_runs_insert_own" ON quest_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quest_runs_update_own" ON quest_runs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_quest_runs_user_id ON quest_runs(user_id);
CREATE INDEX idx_quest_runs_status ON quest_runs(status);
CREATE INDEX idx_quest_runs_started_at ON quest_runs(started_at DESC);

-- ================================
-- user_daily_quotas
-- ================================
CREATE TABLE user_daily_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_date DATE NOT NULL DEFAULT CURRENT_DATE,
  api_calls_made INTEGER NOT NULL DEFAULT 0
    CHECK (api_calls_made >= 0),
  tokens_used INTEGER NOT NULL DEFAULT 0
    CHECK (tokens_used >= 0),
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quota_date)
);

ALTER TABLE user_daily_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotas_select_own" ON user_daily_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quotas_insert_own" ON user_daily_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quotas_update_own" ON user_daily_quotas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_quotas_user_date ON user_daily_quotas(user_id, quota_date);
