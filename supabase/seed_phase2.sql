-- ================================================
-- Phase 2 Seed: CLI prompt templates for quests
-- Adds cli_tool, cli_prompt_template, allowed_commands,
-- working_directory, requires_approval, max_execution_time
-- ================================================

-- Quest 1: self-intro-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報を元に、魅力的な自己紹介文を作成してください。フレンドリーで親しみやすいトーンで、200文字程度にまとめてください。

名前: {{name}}
職業: {{job}}
趣味: {{hobbies}}
トーン: {{tone}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 60
WHERE quest_identifier = 'self-intro-v1';

-- Quest 2: email-draft-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報を元に、適切なメール文を作成してください。件名も提案してください。

宛先: {{recipient}}
用件: {{subject}}
トーン: {{tone}}
補足情報: {{details}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 60
WHERE quest_identifier = 'email-draft-v1';

-- Quest 3: sns-post-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報を元に、SNS投稿文を3パターン作成してください。ハッシュタグも提案してください。

テーマ: {{theme}}
プラットフォーム: {{platform}}
ターゲット: {{target}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 60
WHERE quest_identifier = 'sns-post-v1';

-- Quest 4: announcement-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報を元に、わかりやすいお知らせ文を作成してください。

イベント名: {{event_name}}
日時: {{datetime}}
場所: {{location}}
詳細: {{details}}
対象者: {{audience}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 60
WHERE quest_identifier = 'announcement-v1';

-- Quest 5: meeting-summary-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の会議内容を分析し、以下の形式でまとめてください。

## 議事録要約（3行以内）
## 決定事項
## ToDoリスト（担当者付き）
## 次回アクション

会議の議題: {{topic}}
参加者: {{participants}}
会議の内容: {{content}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 90
WHERE quest_identifier = 'meeting-summary-v1';

-- Quest 6: daily-report-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報から、見やすい日報/週報を作成してください。

## 実施事項（箇条書き）
## 進捗状況
## 課題・問題点
## 明日の予定

報告期間: {{period}}
やったこと: {{tasks_done}}
課題・問題: {{issues}}
明日の予定: {{next_plan}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 90
WHERE quest_identifier = 'daily-report-v1';

-- Quest 7: presentation-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報でプレゼンテーションの構成案を作成してください。各スライドのタイトルと話すポイントを提案してください。

テーマ: {{theme}}
対象者: {{audience}}
発表時間: {{duration}}
目的: {{goal}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 90
WHERE quest_identifier = 'presentation-v1';

-- Quest 8: travel-plan-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報から、具体的な旅行プランを作成してください。日ごとのスケジュール、おすすめスポット、予算配分を含めてください。

目的地: {{destination}}
日数: {{days}}
予算: {{budget}}
旅行スタイル: {{style}}
特に行きたい場所・やりたいこと: {{preferences}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 120
WHERE quest_identifier = 'travel-plan-v1';

-- Quest 9: book-review-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下の情報から、読み応えのある読書感想文を作成してください。あらすじは最小限にし、自分の感想・気づきを中心にしてください。

本のタイトル: {{book_title}}
著者: {{author}}
感想メモ: {{notes}}
文字数: {{length}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 90
WHERE quest_identifier = 'book-review-v1';

-- Quest 10: review-summary-v1
UPDATE preset_quests SET
  cli_tool = 'claude',
  cli_prompt_template = '以下のレビューテキストを分析し、以下の形式でまとめてください。

## 全体評価（5段階で数値化）
## ポジティブな意見（箇条書き）
## ネガティブな意見（箇条書き）
## 改善提案
## 一言まとめ

商品名: {{product_name}}
レビューテキスト: {{reviews}}

出力はMarkdown形式で。',
  allowed_commands = '[]',
  working_directory = 'sandbox',
  requires_approval = FALSE,
  max_execution_time = 90
WHERE quest_identifier = 'review-summary-v1';

