import { notFound } from 'next/navigation';
import { getPresetQuestById, getUserProfile } from '@/features/quest/actions';
import { QuestInputForm } from '@/features/quest/components/QuestInputForm';
import { AgentStatusBanner } from '@/features/quest/components/AgentStatusBanner';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { NPCDialog } from '@/components/ui/NPCDialog';

export default async function QuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quest, user] = await Promise.all([
    getPresetQuestById(id),
    getUserProfile(),
  ]);
  if (!quest) return notFound();
  if (!user) return notFound();

  const difficultyStars = '\u2605'.repeat(quest.difficulty) + '\u2606'.repeat(3 - quest.difficulty);

  return (
    <div className="space-y-4">
      <NPCDialog
        character="sage"
        message="この依頼を受けるのか？入力して実行じゃ！"
        npcName="ギルドマスター"
      />
      <RPGWindow>
        <div className="font-dot-gothic">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{quest.icon}</span>
            <div>
              <h1 className="text-lg font-bold text-rpg-gold">{quest.title}</h1>
              <p className="text-sm text-blue-200/60">{quest.description}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-blue-200/50">
            <span>難易度: <span className="text-rpg-gold">{difficultyStars}</span></span>
            <span>報酬: <span className="text-green-300">+{quest.xp_reward} XP</span></span>
          </div>
        </div>
      </RPGWindow>
      <AgentStatusBanner />
      <QuestInputForm quest={quest} />
    </div>
  );
}
