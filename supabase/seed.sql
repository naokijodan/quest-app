-- ================================
-- Preset Quests Seed Data (10 quests)
-- ================================

INSERT INTO preset_quests (quest_identifier, title, title_en, description, description_en, difficulty, category, xp_reward, prompt_template, output_type, required_inputs, max_tokens_limit, icon, sort_order) VALUES

-- #1 Basic: Self Introduction
('self-intro-v1',
 '自己紹介文作成',
 'Self Introduction',
 '名前・職業・趣味から魅力的な自己紹介文を作成します',
 'Create an appealing self-introduction from your name, job, and hobbies',
 1, 'basic', 10,
 '以下の情報を元に、魅力的な自己紹介文を作成してください。フレンドリーで親しみやすいトーンで、200文字程度にまとめてください。

名前: {{name}}
職業: {{job}}
趣味: {{hobbies}}
トーン: {{tone}}',
 'markdown',
 '[
   {"name": "name", "label": "名前", "type": "text", "description": "あなたの名前", "example": "田中太郎", "validation": {"required": true, "maxLength": 50}},
   {"name": "job", "label": "職業", "type": "text", "description": "お仕事は何ですか？", "example": "Webデザイナー", "validation": {"required": true, "maxLength": 100}},
   {"name": "hobbies", "label": "趣味", "type": "textarea", "description": "趣味を教えてください（複数OK）", "example": "読書、カフェ巡り、写真撮影", "validation": {"required": true, "maxLength": 500}},
   {"name": "tone", "label": "トーン", "type": "select", "description": "文章の雰囲気", "example": "フレンドリー", "options": ["フレンドリー", "ビジネス", "カジュアル", "フォーマル"], "validation": {"required": true}}
 ]',
 500, '👋', 1),

-- #2 Basic: Email Draft
('email-draft-v1',
 'メール文面作成',
 'Email Draft',
 '宛先・用件・トーンから適切なメール文を作成します',
 'Create an appropriate email from recipient, subject, and tone',
 1, 'basic', 10,
 '以下の情報を元に、適切なメール文を作成してください。件名も提案してください。

宛先: {{recipient}}
用件: {{subject}}
トーン: {{tone}}
補足情報: {{details}}',
 'markdown',
 '[
   {"name": "recipient", "label": "宛先", "type": "text", "description": "誰に送るメール？", "example": "取引先の山田さん", "validation": {"required": true, "maxLength": 100}},
   {"name": "subject", "label": "用件", "type": "text", "description": "何についてのメール？", "example": "打ち合わせ日程の調整", "validation": {"required": true, "maxLength": 200}},
   {"name": "tone", "label": "トーン", "type": "select", "description": "メールの雰囲気", "example": "丁寧", "options": ["丁寧", "カジュアル", "フォーマル", "緊急"], "validation": {"required": true}},
   {"name": "details", "label": "補足情報", "type": "textarea", "description": "伝えたい詳細があれば（任意）", "example": "来週の火曜か水曜で調整したい", "validation": {"required": false, "maxLength": 1000}}
 ]',
 800, '✉️', 2),

-- #3 Basic: SNS Post
('sns-post-v1',
 'SNS投稿文作成',
 'SNS Post',
 'テーマとプラットフォームから投稿文を3パターン作成します',
 'Create 3 variations of SNS posts from theme and platform',
 1, 'basic', 10,
 '以下の情報を元に、SNS投稿文を3パターン作成してください。ハッシュタグも提案してください。

テーマ: {{theme}}
プラットフォーム: {{platform}}
ターゲット: {{target}}',
 'markdown',
 '[
   {"name": "theme", "label": "テーマ", "type": "text", "description": "何について投稿する？", "example": "新しいカフェのオープン", "validation": {"required": true, "maxLength": 200}},
   {"name": "platform", "label": "プラットフォーム", "type": "select", "description": "どのSNSに投稿？", "example": "Instagram", "options": ["Instagram", "X (Twitter)", "Facebook", "TikTok", "LinkedIn"], "validation": {"required": true}},
   {"name": "target", "label": "ターゲット", "type": "text", "description": "誰に届けたい？", "example": "20-30代の女性", "validation": {"required": false, "maxLength": 200}}
 ]',
 600, '📱', 3),

-- #4 Basic: Announcement
('announcement-v1',
 'お知らせ文作成',
 'Announcement',
 'イベント名と詳細からお知らせ文を作成します',
 'Create an announcement from event name and details',
 1, 'basic', 10,
 '以下の情報を元に、わかりやすいお知らせ文を作成してください。

イベント名: {{event_name}}
日時: {{datetime}}
場所: {{location}}
詳細: {{details}}
対象者: {{audience}}',
 'markdown',
 '[
   {"name": "event_name", "label": "イベント名", "type": "text", "description": "何のお知らせ？", "example": "社内BBQ大会", "validation": {"required": true, "maxLength": 100}},
   {"name": "datetime", "label": "日時", "type": "text", "description": "いつ？", "example": "2026年4月15日 12:00〜", "validation": {"required": true, "maxLength": 100}},
   {"name": "location", "label": "場所", "type": "text", "description": "どこで？", "example": "代々木公園", "validation": {"required": true, "maxLength": 100}},
   {"name": "details", "label": "詳細", "type": "textarea", "description": "伝えたいこと", "example": "参加費2000円、雨天中止", "validation": {"required": true, "maxLength": 1000}},
   {"name": "audience", "label": "対象者", "type": "text", "description": "誰向け？", "example": "社員全員", "validation": {"required": false, "maxLength": 100}}
 ]',
 800, '📢', 4),

-- #5 Business: Meeting Summary
('meeting-summary-v1',
 '会議の議事録まとめ',
 'Meeting Summary',
 '会議の内容を3行で要約し、ToDoリストも作成します',
 'Summarize meeting in 3 lines and create a ToDo list',
 1, 'business', 20,
 '以下の会議内容を分析し、以下の形式でまとめてください。

## 議事録要約（3行以内）
## 決定事項
## ToDoリスト（担当者付き）
## 次回アクション

会議の議題: {{topic}}
参加者: {{participants}}
会議の内容: {{content}}',
 'markdown',
 '[
   {"name": "topic", "label": "会議の議題", "type": "text", "description": "会議の主なトピック", "example": "新製品ローンチ戦略", "validation": {"required": true, "maxLength": 200}},
   {"name": "participants", "label": "参加者", "type": "textarea", "description": "参加メンバー（改行で区切り）", "example": "田中太郎\n山田花子\n佐藤一郎", "validation": {"required": false, "maxLength": 500}},
   {"name": "content", "label": "会議の内容", "type": "textarea", "description": "話した内容をざっくり入力（箇条書きOK）", "example": "・新製品の発売日を3月に決定\n・マーケティング予算は500万円\n・プレスリリースは田中が担当", "validation": {"required": true, "minLength": 10, "maxLength": 5000}}
 ]',
 1000, '📝', 5),

-- #6 Business: Daily Report
('daily-report-v1',
 '日報・週報作成',
 'Daily/Weekly Report',
 '今日やったことと課題から整形された報告書を作成します',
 'Create a formatted report from tasks done and issues',
 2, 'business', 20,
 '以下の情報から、見やすい日報/週報を作成してください。

## 実施事項（箇条書き）
## 進捗状況
## 課題・問題点
## 明日の予定

報告期間: {{period}}
やったこと: {{tasks_done}}
課題・問題: {{issues}}
明日の予定: {{next_plan}}',
 'markdown',
 '[
   {"name": "period", "label": "報告期間", "type": "select", "description": "日報？週報？", "example": "日報", "options": ["日報", "週報", "月報"], "validation": {"required": true}},
   {"name": "tasks_done", "label": "やったこと", "type": "textarea", "description": "今日（今週）やったことを箇条書きで", "example": "・クライアントA社へ提案書送付\n・社内MTG参加\n・見積もり作成", "validation": {"required": true, "minLength": 10, "maxLength": 3000}},
   {"name": "issues", "label": "課題・問題", "type": "textarea", "description": "困っていること（あれば）", "example": "納期が厳しい案件がある", "validation": {"required": false, "maxLength": 1000}},
   {"name": "next_plan", "label": "次の予定", "type": "textarea", "description": "明日（来週）やる予定", "example": "・B社訪問\n・企画書作成", "validation": {"required": false, "maxLength": 1000}}
 ]',
 1000, '📅', 6),

-- #7 Business: Presentation
('presentation-v1',
 'プレゼン構成作成',
 'Presentation Outline',
 'テーマ・対象者・時間からスライド構成案を作成します',
 'Create slide outline from theme, audience, and duration',
 2, 'business', 20,
 '以下の情報でプレゼンテーションの構成案を作成してください。各スライドのタイトルと話すポイントを提案してください。

テーマ: {{theme}}
対象者: {{audience}}
発表時間: {{duration}}
目的: {{goal}}',
 'markdown',
 '[
   {"name": "theme", "label": "テーマ", "type": "text", "description": "プレゼンの主題", "example": "DX推進による業務効率化", "validation": {"required": true, "maxLength": 200}},
   {"name": "audience", "label": "対象者", "type": "text", "description": "誰に向けて発表する？", "example": "経営陣", "validation": {"required": true, "maxLength": 200}},
   {"name": "duration", "label": "発表時間", "type": "select", "description": "何分のプレゼン？", "example": "15分", "options": ["5分", "10分", "15分", "30分", "60分"], "validation": {"required": true}},
   {"name": "goal", "label": "目的", "type": "textarea", "description": "このプレゼンで達成したいこと", "example": "DX推進の予算承認を得る", "validation": {"required": true, "maxLength": 500}}
 ]',
 1200, '📊', 7),

-- #8 Life: Travel Plan
('travel-plan-v1',
 '旅行プラン作成',
 'Travel Plan',
 '目的地・日数・予算・好みから旅行日程表を作成します',
 'Create a travel itinerary from destination, days, budget, and preferences',
 2, 'life', 20,
 '以下の情報から、具体的な旅行プランを作成してください。日ごとのスケジュール、おすすめスポット、予算配分を含めてください。

目的地: {{destination}}
日数: {{days}}
予算: {{budget}}
旅行スタイル: {{style}}
特に行きたい場所・やりたいこと: {{preferences}}',
 'markdown',
 '[
   {"name": "destination", "label": "目的地", "type": "text", "description": "どこに行く？", "example": "京都", "validation": {"required": true, "maxLength": 100}},
   {"name": "days", "label": "日数", "type": "select", "description": "何日間の旅行？", "example": "2泊3日", "options": ["日帰り", "1泊2日", "2泊3日", "3泊4日", "4泊5日以上"], "validation": {"required": true}},
   {"name": "budget", "label": "予算", "type": "text", "description": "1人あたりの予算（交通費込み）", "example": "5万円", "validation": {"required": true, "maxLength": 50}},
   {"name": "style", "label": "旅行スタイル", "type": "select", "description": "どんな旅行？", "example": "観光メイン", "options": ["観光メイン", "グルメ重視", "のんびり", "アクティブ", "歴史・文化"], "validation": {"required": true}},
   {"name": "preferences", "label": "行きたい場所・やりたいこと", "type": "textarea", "description": "特にやりたいことがあれば", "example": "嵐山の竹林、伏見稲荷大社は絶対行きたい", "validation": {"required": false, "maxLength": 1000}}
 ]',
 1500, '🌍', 8),

-- #9 Creative: Book Review
('book-review-v1',
 '読書感想文',
 'Book Review',
 '本のタイトルと感想メモから読書感想文を作成します',
 'Create a book review from title and notes',
 2, 'creative', 20,
 '以下の情報から、読み応えのある読書感想文を作成してください。あらすじは最小限にし、自分の感想・気づきを中心にしてください。

本のタイトル: {{book_title}}
著者: {{author}}
感想メモ: {{notes}}
文字数: {{length}}',
 'markdown',
 '[
   {"name": "book_title", "label": "本のタイトル", "type": "text", "description": "読んだ本のタイトル", "example": "嫌われる勇気", "validation": {"required": true, "maxLength": 200}},
   {"name": "author", "label": "著者", "type": "text", "description": "誰が書いた本？", "example": "岸見一郎・古賀史健", "validation": {"required": false, "maxLength": 100}},
   {"name": "notes", "label": "感想メモ", "type": "textarea", "description": "読んで思ったことをメモ程度で", "example": "・自分の人生は自分で決められるという考えに共感\n・承認欲求を捨てるのは難しい\n・対人関係の悩みが軽くなった気がする", "validation": {"required": true, "minLength": 10, "maxLength": 3000}},
   {"name": "length", "label": "文字数", "type": "select", "description": "どのくらいの長さ？", "example": "800文字", "options": ["400文字（短め）", "800文字（標準）", "1200文字（長め）", "2000文字（詳細）"], "validation": {"required": true}}
 ]',
 1000, '📖', 9),

-- #10 Analysis: Review Summary
('review-summary-v1',
 '商品レビュー要約',
 'Review Summary',
 'レビューテキストを要約し、ポジティブ/ネガティブ分析を行います',
 'Summarize reviews and analyze positive/negative sentiments',
 2, 'analysis', 20,
 '以下のレビューテキストを分析し、以下の形式でまとめてください。

## 全体評価（5段階で数値化）
## ポジティブな意見（箇条書き）
## ネガティブな意見（箇条書き）
## 改善提案
## 一言まとめ

商品名: {{product_name}}
レビューテキスト: {{reviews}}',
 'markdown',
 '[
   {"name": "product_name", "label": "商品名", "type": "text", "description": "何のレビュー？", "example": "ワイヤレスイヤホン XYZ-100", "validation": {"required": true, "maxLength": 200}},
   {"name": "reviews", "label": "レビューテキスト", "type": "textarea", "description": "レビューをまとめて貼り付け", "example": "音質がとても良い。ノイズキャンセリングも効く。ただしバッテリーの持ちが悪い。装着感は良好。", "validation": {"required": true, "minLength": 20, "maxLength": 5000}}
 ]',
 1000, '🔍', 10);
