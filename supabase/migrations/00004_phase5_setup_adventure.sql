-- Phase 5: 第0章「旅の準備」 - CLIセットアップを冒険に統合
-- 制約を変更して chapter 0 を許可 + 3つのセットアップクエストを追加

-- preset_quests の adventure_chapter 制約を 0始まりに変更
ALTER TABLE preset_quests DROP CONSTRAINT IF EXISTS preset_quests_adventure_chapter_check;
ALTER TABLE preset_quests ADD CONSTRAINT preset_quests_adventure_chapter_check
  CHECK (adventure_chapter IS NULL OR adventure_chapter BETWEEN 0 AND 5);

-- adventure_progress の chapter 制約を 0始まりに変更
ALTER TABLE adventure_progress DROP CONSTRAINT IF EXISTS adventure_progress_chapter_check;
ALTER TABLE adventure_progress ADD CONSTRAINT adventure_progress_chapter_check
  CHECK (chapter BETWEEN 0 AND 5);

INSERT INTO preset_quests (
  quest_identifier, title, title_en, description, description_en,
  difficulty, category, xp_reward, prompt_template,
  cli_tool, cli_prompt_template, allowed_commands, working_directory,
  requires_approval, max_execution_time, output_type, required_inputs,
  max_tokens_limit, icon, is_active, version, sort_order,
  quest_type, adventure_chapter, adventure_order,
  story_intro, story_complete, terminal_command
) VALUES
-- Quest 0-1: 武器の確認（CLI検出）
(
  'ch0-weapon-check',
  '武器の確認',
  'Weapon Check',
  'あなたの武器（CLIツール）が使える状態か確認しよう。',
  'Check if your weapon (CLI tool) is ready.',
  1, 'adventure', 10, '',
  'claude', NULL, '{}', 'sandbox',
  false, 60, 'text', '[]',
  100, '⚔️', true, 1, 1,
  'adventure', 0, 1,
  '老賢者「おお、新たな冒険者よ。旅に出る前に、まずは武器を確認せねばならぬ。CLIという名の武器が、そなたの手元にあるかどうか…」',
  '老賢者「よくやった！武器の準備は万端じゃ。これで冒険に出る資格がある。」',
  NULL
),
-- Quest 0-2: 武器を鍛える（CLIインストールガイド）
(
  'ch0-weapon-forge',
  '武器を鍛える',
  'Forge Your Weapon',
  'CLIツールをインストールして、武器を手に入れよう。',
  'Install CLI tools to forge your weapon.',
  1, 'adventure', 15, '',
  'claude', NULL, '{}', 'sandbox',
  false, 120, 'text', '[]',
  100, '🔨', true, 1, 2,
  'adventure', 0, 2,
  '鍛冶師「やあ、冒険者殿！武器がまだないと聞いたぞ。ワシが最高の武器を鍛えてやろう。ターミナルを開いて、以下のコマンドを唱えるのじゃ。」',
  '鍛冶師「見事な武器が出来上がったぞ！これがあれば、どんなモンスターとも戦える。」',
  NULL
),
-- Quest 0-3: 仲間を呼び出す（Agent起動確認）
(
  'ch0-summon-ally',
  '仲間を呼び出す',
  'Summon Your Ally',
  'Quest Agentを起動して、冒険の仲間を召喚しよう。',
  'Start the Quest Agent to summon your ally.',
  1, 'adventure', 15, '',
  'claude', NULL, '{}', 'sandbox',
  false, 120, 'text', '[]',
  100, '🧙', true, 1, 3,
  'adventure', 0, 3,
  '魔術師「冒険者よ、一人で旅に出るつもりか？仲間がいれば百人力じゃ。Quest Agentという名の仲間を呼び出そう。」',
  '魔術師「素晴らしい！仲間が応答したぞ。これで冒険の準備は整った。さあ、ギルドに戻って依頼を受けるのじゃ！」',
  NULL
);
