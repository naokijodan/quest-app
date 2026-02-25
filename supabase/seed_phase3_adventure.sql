-- Phase 3: Adventure Quest Seed Data
-- 5 chapters, 3-4 quests per chapter

-- ================================
-- Chapter 1: 旅立ちの村 (Lv.1-2) — AIが全部やってくれる
-- ================================

INSERT INTO preset_quests (
  quest_identifier, title, description, difficulty, category,
  xp_reward, prompt_template, cli_tool, cli_prompt_template,
  quest_type, adventure_chapter, adventure_order,
  story_intro, story_complete, terminal_command,
  allowed_commands, working_directory, max_execution_time,
  output_type, required_inputs, icon, sort_order
) VALUES
(
  'adv-1-1',
  '最初のお願い',
  'マスコットにお願いして、自己紹介文を書いてもらおう。',
  1, 'adventure', 15,
  'あなたは冒険の案内役です。ユーザーの名前は{{name}}です。この冒険者の魅力的な自己紹介文を100文字程度で書いてください。RPGの世界観で、温かい口調で。',
  'claude',
  'あなたは冒険の案内役です。ユーザーの名前は{{name}}です。この冒険者の魅力的な自己紹介文を100文字程度で書いてください。RPGの世界観で、温かい口調で。',
  'adventure', 1, 1,
  'ようこそ、勇敢な冒険者よ！\nこの世界では、ターミナルという名の魔王が君臨している。\nまずは村の住人に自己紹介をしよう。マスコットが代わりにやってくれるぞ。',
  '素晴らしい自己紹介だ！村の住人たちが温かく迎えてくれたぞ。\n冒険の第一歩を踏み出した！',
  NULL,
  '[]', 'sandbox', 60,
  'text',
  '[{"name":"name","label":"あなたの名前","type":"text","description":"冒険者としての名前を入力","example":"タロウ","validation":{"required":true,"minLength":1,"maxLength":20}}]',
  '🏠', 100
),
(
  'adv-1-2',
  '村の掲示板',
  'マスコットに頼んで、今日のニュースを要約してもらおう。',
  1, 'adventure', 15,
  '以下のトピックについて、RPGの村の掲示板風に3つのニュースを作成してください。テーマ: {{topic}}。各ニュースは1-2文で、ファンタジー世界観で。',
  'claude',
  '以下のトピックについて、RPGの村の掲示板風に3つのニュースを作成してください。テーマ: {{topic}}。各ニュースは1-2文で、ファンタジー世界観で。',
  'adventure', 1, 2,
  '村の掲示板に何か面白い情報はないかな？\nマスコットが代わりに調べてくれるぞ。',
  '村の掲示板をチェック完了！情報収集は冒険の基本だ。',
  NULL,
  '[]', 'sandbox', 60,
  'text',
  '[{"name":"topic","label":"気になるトピック","type":"text","description":"どんな話題が気になる？","example":"天気","validation":{"required":true,"minLength":1,"maxLength":50}}]',
  '📋', 101
),
(
  'adv-1-3',
  '旅の準備リスト',
  'マスコットに冒険の持ち物リストを作ってもらおう。',
  1, 'adventure', 20,
  '{{destination}}への冒険に必要な持ち物リストを、RPGの世界観で10個作成してください。各アイテムに簡単な説明（効果）を付けてください。楽しい口調で。',
  'claude',
  '{{destination}}への冒険に必要な持ち物リストを、RPGの世界観で10個作成してください。各アイテムに簡単な説明（効果）を付けてください。楽しい口調で。',
  'adventure', 1, 3,
  'いよいよ旅立ちの準備だ！\nマスコットが持ち物リストを作ってくれるぞ。',
  '準備万端！これで旅立ちの準備は完了だ。\n第1章クリア！次は森の試練が待っている...',
  NULL,
  '[]', 'sandbox', 60,
  'text',
  '[{"name":"destination","label":"冒険の目的地","type":"text","description":"どこへ冒険に行く？","example":"魔王城","validation":{"required":true,"minLength":1,"maxLength":30}}]',
  '🎒', 102
),

-- ================================
-- Chapter 2: 森の試練 (Lv.3-4) — 簡単なコマンドを実行
-- ================================
(
  'adv-2-1',
  '森の地図を読め',
  'lsコマンドで森（ディレクトリ）の中身を確認しよう。',
  1, 'adventure', 25,
  'ユーザーが ls コマンドを学んでいます。現在のディレクトリの内容を一覧表示してください。結果の各項目について、RPGの森の中にあるものとして1行説明を追加してください。',
  'claude',
  'ls コマンドを実行して、現在のサンドボックスディレクトリの内容を表示してください。結果をRPGの「森の探索」として表現してください。ファイルやフォルダがなければ「まだ何もない荒野」と表現して。',
  'adventure', 2, 1,
  '森に足を踏み入れた！\n「ls」というコマンドで、この森にどんな木（ファイル）があるか見てみよう。\nこれがターミナルの最初の一歩だ。',
  '森の地図が読めるようになった！\n「ls」は周りを見渡すコマンドだ。覚えておこう。',
  'ls',
  '["ls"]', 'sandbox', 30,
  'text',
  '[]',
  '🗺️', 200
),
(
  'adv-2-2',
  '宝箱を開けろ',
  'catコマンドでファイルの中身を読もう。',
  1, 'adventure', 25,
  'まず echo "おめでとう！宝箱の中には伝説の剣が入っていた！ ATK+50" > treasure.txt を実行し、次に cat treasure.txt を実行して中身を表示してください。RPG風に結果を解説してください。',
  'claude',
  'まず echo "おめでとう！宝箱の中には伝説の剣が入っていた！ ATK+50" > treasure.txt を実行し、次に cat treasure.txt を実行して中身を表示してください。RPG風に結果を解説してください。',
  'adventure', 2, 2,
  '森の奥に宝箱を発見！\n「cat」コマンドで宝箱（ファイル）の中身を覗いてみよう。',
  'やった！宝箱を開けることができた！\n「cat」はファイルの中身を読むコマンドだ。',
  'cat',
  '["cat","echo"]', 'sandbox', 30,
  'text',
  '[]',
  '📦', 201
),
(
  'adv-2-3',
  '道を進め',
  'cdコマンドでディレクトリを移動しよう。',
  1, 'adventure', 25,
  'ユーザーがcdコマンドを学んでいます。まず mkdir -p forest/cave を実行してディレクトリを作成し、cd forest && ls と cd cave && ls を順に実行して移動を見せてください。RPGの「森を歩いて洞窟に入る」として表現してください。',
  'claude',
  'mkdir -p forest/cave を実行してディレクトリを作成し、cd forest && ls と cd cave && echo "洞窟の奥に光が見える..." > discovery.txt && cat discovery.txt を順に実行してください。RPGの「森を歩いて洞窟に入る」として表現してください。',
  'adventure', 2, 3,
  '森の中に小道が見える。\n「cd」コマンドで別の場所（ディレクトリ）に移動してみよう。',
  '森の奥、洞窟の中まで進むことができた！\n「cd」は場所を移動するコマンド。「mkdir」は新しい場所を作るコマンドだ。\n第2章クリア！次は山岳の修行が待っている...',
  'cd',
  '["cd","mkdir","ls","echo","cat"]', 'sandbox', 30,
  'text',
  '[]',
  '🚶', 202
),

-- ================================
-- Chapter 3: 山岳の修行 (Lv.5-6) — ファイル操作 + git基本
-- ================================
(
  'adv-3-1',
  '拠点を作れ',
  'mkdirとtouchでファイル・ディレクトリを作成しよう。',
  2, 'adventure', 40,
  'ユーザーがmkdirとtouchを学んでいます。以下を順に実行してください:\n1. mkdir -p base_camp/weapons base_camp/potions base_camp/logs\n2. touch base_camp/weapons/iron_sword.txt base_camp/potions/heal_potion.txt\n3. echo "ATK+30 鉄の剣" > base_camp/weapons/iron_sword.txt\n4. echo "HP+50 回復薬" > base_camp/potions/heal_potion.txt\n5. ls -R base_camp\nRPGの「冒険の拠点建設」として結果を表現してください。',
  'claude',
  'mkdir -p base_camp/weapons base_camp/potions base_camp/logs && touch base_camp/weapons/iron_sword.txt base_camp/potions/heal_potion.txt && echo "ATK+30 鉄の剣" > base_camp/weapons/iron_sword.txt && echo "HP+50 回復薬" > base_camp/potions/heal_potion.txt && ls -R base_camp を実行し、RPGの「冒険の拠点建設」として結果を表現してください。',
  'adventure', 3, 1,
  '山岳地帯に到着。ここで修行の拠点を作ろう！\n「mkdir」で場所を、「touch」で新しいアイテム（ファイル）を作るんだ。',
  '立派な拠点ができた！ディレクトリ構造はファイルの整理術。\nこれはプログラマーの基本スキルだ。',
  'mkdir',
  '["mkdir","touch","echo","ls"]', 'sandbox', 60,
  'text',
  '[]',
  '🏗️', 300
),
(
  'adv-3-2',
  'アイテムを整理せよ',
  'cpとmvでファイルをコピー・移動しよう。',
  2, 'adventure', 40,
  'ユーザーがcpとmvを学んでいます。前のクエストで作ったbase_campを前提に:\n1. cp base_camp/weapons/iron_sword.txt base_camp/weapons/iron_sword_backup.txt\n2. mv base_camp/potions/heal_potion.txt base_camp/potions/mega_potion.txt\n3. ls base_camp/weapons base_camp/potions\nRPGの「アイテム整理・強化」として結果を表現してください。base_campが存在しない場合は先に作成してください。',
  'claude',
  'まずbase_campが存在しない場合は mkdir -p base_camp/weapons base_camp/potions で作成し、echo "ATK+30" > base_camp/weapons/iron_sword.txt && echo "HP+50" > base_camp/potions/heal_potion.txt を実行。その後 cp base_camp/weapons/iron_sword.txt base_camp/weapons/iron_sword_backup.txt && mv base_camp/potions/heal_potion.txt base_camp/potions/mega_potion.txt && ls base_camp/weapons base_camp/potions を実行し、RPGのアイテム管理として表現してください。',
  'adventure', 3, 2,
  'アイテムの整理をしよう。\n「cp」はコピー（複製）、「mv」は移動（名前変更にも使える）。\n道具の管理は冒険者の基本だ。',
  'アイテムの整理完了！\n「cp」でバックアップ、「mv」でリネーム。覚えたな！',
  'cp / mv',
  '["cp","mv","mkdir","echo","ls","touch"]', 'sandbox', 60,
  'text',
  '[]',
  '📦', 301
),
(
  'adv-3-3',
  '冒険の記録',
  'git init + git add + git commitで冒険日記を始めよう。',
  2, 'adventure', 50,
  'ユーザーがgitの基本を学んでいます。以下を順に実行してください:\n1. mkdir -p adventure_diary && cd adventure_diary\n2. git init\n3. echo "# 冒険日記\n\n## 第1日\n山岳の修行を開始した。" > diary.md\n4. git add diary.md\n5. git status\n6. git commit -m "冒険日記を始めた"\n7. git log --oneline\nRPGの「冒険日記をつけ始める」として各ステップを解説してください。',
  'claude',
  'mkdir -p adventure_diary && cd adventure_diary && git init && echo "# 冒険日記" > diary.md && echo "" >> diary.md && echo "## 第1日" >> diary.md && echo "山岳の修行を開始した。" >> diary.md && git add diary.md && git status && git commit -m "冒険日記を始めた" && git log --oneline を実行し、RPGの冒険日記として各ステップを解説してください。',
  'adventure', 3, 3,
  'これは重要な修行だ。「git」は冒険の記録を管理する魔法。\n「init」で日記帳を用意し、「add」で記録を選び、「commit」で永久保存する。',
  'gitの基本をマスターした！これは現代のプログラマーの最重要スキルだ。\n第3章クリア！魔王城への道が見えてきた...',
  'git init / add / commit',
  '["git","mkdir","echo","cd"]', 'sandbox', 120,
  'text',
  '[]',
  '📖', 302
),

-- ================================
-- Chapter 4: 魔王城への道 (Lv.7-8) — パッケージ管理・スクリプト実行
-- ================================
(
  'adv-4-1',
  '武器を鍛えろ',
  'npm initとnpm installでプロジェクトを作成しよう。',
  2, 'adventure', 60,
  'ユーザーがnpmの基本を学んでいます。以下を順に実行:\n1. mkdir -p weapon_forge && cd weapon_forge\n2. npm init -y\n3. cat package.json\n4. npm install chalk\n5. ls node_modules/.package-lock.json || ls node_modules\nRPGの「武器を鍛える（プロジェクトを作る）」として各ステップを解説してください。',
  'claude',
  'mkdir -p weapon_forge && cd weapon_forge && npm init -y && cat package.json && npm install chalk && ls node_modules を実行してください。RPGの「武器鍛冶」として各ステップを解説してください。',
  'adventure', 4, 1,
  '魔王城に向かう前に、もっと強い武器が必要だ。\n「npm」はパッケージ（道具）を管理するコマンド。\n「init」で新しい武器庫を作り、「install」で素材を集めよう。',
  'npm initとinstallをマスターした！\nこれでNode.jsの世界で武器（ライブラリ）を自由に使えるようになった。',
  'npm init / install',
  '["npm","mkdir","cd","cat","ls"]', 'sandbox', 120,
  'text',
  '[]',
  '⚔️', 400
),
(
  'adv-4-2',
  '呪文を唱えろ',
  'Node.jsスクリプトを作成して実行しよう。',
  2, 'adventure', 60,
  'ユーザーがNode.jsスクリプトの実行を学んでいます。以下を実行:\n1. mkdir -p spell_book && cd spell_book\n2. 以下の内容でspell.jsを作成:\nconst spells = ["ファイアボール", "ヒール", "サンダー", "ブリザード"];\nconsole.log("=== 魔法書 ===");\nspells.forEach((spell, i) => console.log(`${i+1}. ${spell}`));\nconsole.log(`\\n全${spells.length}種の魔法を習得！`);\n3. node spell.js\nRPGの「魔法の修行」として解説してください。',
  'claude',
  'mkdir -p spell_book && cd spell_book を実行し、以下の内容でspell.jsを作成してください:\nconst spells = ["ファイアボール", "ヒール", "サンダー", "ブリザード"];\nconsole.log("=== 魔法書 ===");\nspells.forEach((spell, i) => console.log(`${i+1}. ${spell}`));\nconsole.log(`\\n全${spells.length}種の魔法を習得！`);\nその後 node spell.js を実行してください。RPGの魔法修行として解説してください。',
  'adventure', 4, 2,
  '魔法（スクリプト）を覚える時が来た！\nJavaScriptファイルを書いて、「node」コマンドで実行するんだ。',
  'スクリプト実行をマスターした！\nこれでプログラムを自分で書いて動かせるようになった。\n魔王城が目の前に見えてきた...',
  'node script.js',
  '["node","mkdir","cd","echo"]', 'sandbox', 60,
  'text',
  '[]',
  '🔮', 401
),
(
  'adv-4-3',
  'エラーを読み解け',
  'エラーメッセージを読んで、自分で問題を解決しよう。',
  3, 'adventure', 80,
  'ユーザーがエラーの読み方を学んでいます。以下を実行してください:\n1. 意図的にエラーが出るスクリプトを作成（未定義変数の参照等）\n2. 実行してエラーを見せる\n3. エラーメッセージの読み方を解説（ファイル名、行番号、エラー種類）\n4. 修正版を作成して再実行\n5. RPGの「罠を解除する」として全体を解説してください。',
  'claude',
  'まず mkdir -p trap_room && cd trap_room を実行。次に意図的にエラーが出るJSファイル(trap.js)を作成して実行してください。エラーメッセージの読み方を「RPGの罠解除」として解説し、修正版を作って再実行してください。',
  'adventure', 4, 3,
  '魔王城への道に罠が仕掛けられている！\nエラーメッセージは「罠の仕組み」を教えてくれる。読み方を覚えれば怖くない。',
  'エラーを読み解く力を手に入れた！\nプログラマーはエラーを恐れない。エラーは友達だ。\n第4章クリア！いよいよ魔王との対決だ！',
  'エラー解読',
  '["node","mkdir","cd","echo","cat"]', 'sandbox', 120,
  'text',
  '[]',
  '🪤', 402
),

-- ================================
-- Chapter 5: 魔王戦 (Lv.9-10) — ターミナル自由操作
-- ================================
(
  'adv-5-1',
  '魔王の門',
  'CLIツールをインストールする準備をしよう。',
  3, 'adventure', 100,
  'ユーザーがCLIツールのインストールを学んでいます。以下を確認・実行:\n1. node --version\n2. npm --version\n3. which claude || which codex || which gemini\n4. 各ツールの説明と、未インストールの場合のインストール方法を案内\nRPGの「魔王城の門を開ける儀式」として解説してください。',
  'claude',
  'node --version && npm --version を実行し、which claude; which codex; which gemini を確認してください。結果をRPGの「魔王城の門を開ける儀式」として解説してください。インストールされていないツールがあれば案内も。',
  'adventure', 5, 1,
  'ついに魔王城の門前に立った。\n門を開けるには「正しいツール」が必要だ。\n自分の環境に何があるか確認しよう。',
  '環境の確認完了！門が開き始めた。\n次はいよいよ魔王（ターミナル）との直接対決だ。',
  'which / --version',
  '["node","npm","which"]', 'sandbox', 60,
  'text',
  '[]',
  '🚪', 500
),
(
  'adv-5-2',
  '魔王との対決',
  'ターミナルで自由にプロジェクトを作成しよう。',
  3, 'adventure', 150,
  'ユーザーが最終試練に挑んでいます。以下のタスクをCLIだけで完了してください:\n1. プロジェクトディレクトリの作成\n2. package.json の初期化\n3. index.js に「Hello, Terminal Master!」を出力するスクリプトを作成\n4. 実行して結果を確認\n5. git init → git add → git commit\n全ステップを「魔王戦」のRPG演出で解説してください。最後に「ターミナルマスター」の称号を授与。',
  'claude',
  '最終試練です。CLIだけで以下を完了してください:\n1. mkdir final_battle && cd final_battle\n2. npm init -y\n3. index.jsに console.log("Hello, Terminal Master!") を書く\n4. node index.js で実行\n5. git init && git add -A && git commit -m "I conquered the terminal!"\n全ステップを魔王戦のRPG演出で解説し、最後に「ターミナルマスター」の称号を授与してください。',
  'adventure', 5, 2,
  '「ようこそ、勇者よ。私がターミナル、この世界の魔王だ。」\n「お前がここまで来られたことには敬意を表する。」\n「だが、最後の試練を乗り越えられるかな？」\n\n全てのスキルを使って、ゼロからプロジェクトを作り上げろ！',
  '「...まさか、本当にやり遂げるとは。」\n「認めよう。お前は——ターミナルマスターだ。」\n\n🎉 おめでとう！ターミナルを克服した！\nこれからはAI CLIツールを自由に使いこなせる！\n\n【称号獲得: ターミナルマスター】',
  'フルプロジェクト作成',
  '["mkdir","cd","npm","node","git","echo","cat","ls","touch"]', 'sandbox', 300,
  'text',
  '[]',
  '👑', 501
);
