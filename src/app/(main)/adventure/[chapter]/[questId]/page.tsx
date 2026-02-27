import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AgentStatusBanner } from '@/features/quest/components/AgentStatusBanner';
import { AdventureQuestRunner } from '@/features/adventure/components/AdventureQuestRunner';
import { SetupChapterRunner } from '@/features/adventure/components/SetupChapterRunner';
import { NPCDialog } from '@/components/ui/NPCDialog';
import { startAdventureChapter } from '@/features/adventure/actions';

export default async function AdventureQuestDetailPage({ params }: { params: Promise<{ chapter: string; questId: string }> }) {
  const { chapter, questId } = await params;
  const chapterNum = Number(chapter);
  const questIdentifier = decodeURIComponent(questId);

  const supabase = await createClient();
  const { data: quest } = await supabase
    .from('preset_quests')
    .select('*')
    .eq('quest_type', 'adventure')
    .eq('adventure_chapter', chapterNum)
    .eq('quest_identifier', questIdentifier)
    .maybeSingle();

  if (!quest) return notFound();

  // Ensure chapter progress initialized
  await startAdventureChapter(chapterNum);

  // Find next quest in this chapter (for setup chapter navigation)
  const { data: nextQuest } = await supabase
    .from('preset_quests')
    .select('quest_identifier')
    .eq('quest_type', 'adventure')
    .eq('adventure_chapter', chapterNum)
    .eq('adventure_order', (quest.adventure_order ?? 0) + 1)
    .maybeSingle();

  const nextHref = nextQuest
    ? `/adventure/${chapterNum}/${encodeURIComponent(nextQuest.quest_identifier as string)}`
    : null;

  // Chapter 0 uses special setup components
  if (chapterNum === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{quest.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{quest.title}</h1>
            <p className="mt-1 text-sm text-muted">{quest.description}</p>
          </div>
        </div>
        <SetupChapterRunner quest={quest as any} nextHref={nextHref} />
      </div>
    );
  }

  const chapterMessages: Record<number, string> = {
    1: 'この依頼はAIに任せるだけじゃ。結果を見届けるがよい。',
    2: 'コマンドを使う依頼じゃ。ヒントをよく読んで挑むのじゃ。',
    3: 'ファイル操作とGitの技を磨く時じゃ。慎重に進めよ。',
    4: 'パッケージ管理の試練じゃ。ここを越えれば魔王城が見えるぞ。',
    5: '最終決戦じゃ…全力で挑むのじゃ！',
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{quest.title}</h1>
        <p className="mt-1 text-sm text-muted">{quest.description}</p>
      </div>
      <NPCDialog
        character="wizard"
        message={chapterMessages[chapterNum] ?? 'この依頼を遂行するのじゃ。'}
        npcName="導きの魔法使い"
      />
      <AgentStatusBanner />
      <AdventureQuestRunner quest={quest as any} />
    </div>
  );
}
