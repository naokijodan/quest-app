import { notFound } from 'next/navigation';
import { getPresetQuestById, getUserProfile } from '@/features/quest/actions';
import { QuestInputForm } from '@/features/quest/components/QuestInputForm';
import { AgentStatusBanner } from '@/features/quest/components/AgentStatusBanner';

export default async function QuestDetailPage({ params }: { params: { id: string } }) {
  const [quest, user] = await Promise.all([
    getPresetQuestById(params.id),
    getUserProfile(),
  ]);
  if (!quest) return notFound();
  if (!user) return notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{quest.title}</h1>
        <p className="mt-1 text-sm text-muted">{quest.description}</p>
      </div>
      <AgentStatusBanner />
      <QuestInputForm quest={quest} />
    </div>
  );
}
