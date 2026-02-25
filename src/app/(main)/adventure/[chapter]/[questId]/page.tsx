import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AgentStatusBanner } from '@/features/quest/components/AgentStatusBanner';
import { AdventureQuestRunner } from '@/features/adventure/components/AdventureQuestRunner';
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{quest.title}</h1>
        <p className="mt-1 text-sm text-muted">{quest.description}</p>
      </div>
      <AgentStatusBanner />
      <AdventureQuestRunner quest={quest as any} />
    </div>
  );
}
