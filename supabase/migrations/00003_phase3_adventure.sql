-- Phase 3: Adventure Route — DB Schema
-- adventure_progress table, users.adventure_chapter, adventure quest categories

-- ================================
-- adventure_progress
-- ================================
CREATE TABLE adventure_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL DEFAULT 1
    CHECK (chapter BETWEEN 1 AND 5),
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

CREATE INDEX idx_adventure_progress_user ON adventure_progress(user_id);
CREATE INDEX idx_adventure_progress_chapter ON adventure_progress(chapter);

-- ================================
-- users extension
-- ================================
ALTER TABLE users ADD COLUMN adventure_chapter INTEGER NOT NULL DEFAULT 0
  CHECK (adventure_chapter BETWEEN 0 AND 5);

-- ================================
-- preset_quests: add adventure category + quest_type column
-- ================================
ALTER TABLE preset_quests DROP CONSTRAINT IF EXISTS preset_quests_category_check;
ALTER TABLE preset_quests ADD CONSTRAINT preset_quests_category_check
  CHECK (category IN ('basic', 'business', 'life', 'creative', 'analysis', 'adventure'));

ALTER TABLE preset_quests ADD COLUMN quest_type TEXT NOT NULL DEFAULT 'normal'
  CHECK (quest_type IN ('normal', 'adventure'));

ALTER TABLE preset_quests ADD COLUMN adventure_chapter INTEGER
  CHECK (adventure_chapter IS NULL OR adventure_chapter BETWEEN 1 AND 5);

ALTER TABLE preset_quests ADD COLUMN adventure_order INTEGER;

ALTER TABLE preset_quests ADD COLUMN story_intro TEXT;
ALTER TABLE preset_quests ADD COLUMN story_complete TEXT;
ALTER TABLE preset_quests ADD COLUMN terminal_command TEXT;
