'use client';

import { useRouter } from 'next/navigation';
import type { PresetQuest } from '@/types';
import { SetupQuestWeaponCheck } from './SetupQuestWeaponCheck';
import { SetupQuestWeaponForge } from './SetupQuestWeaponForge';
import { SetupQuestSummonAlly } from './SetupQuestSummonAlly';
import { SetupQuestDiscoverTerminal } from './SetupQuestDiscoverTerminal';
import { completeAdventureQuest } from '@/features/adventure/actions';

interface Props {
  quest: PresetQuest;
  nextHref: string | null;
}

const SETUP_COMPONENTS: Record<string, React.ComponentType<{ quest: PresetQuest; onComplete: () => void }>> = {
  'ch0-discover-terminal': SetupQuestDiscoverTerminal,
  'ch0-weapon-check': SetupQuestWeaponCheck,
  'ch0-weapon-forge': SetupQuestWeaponForge,
  'ch0-summon-ally': SetupQuestSummonAlly,
};

export function SetupChapterRunner({ quest, nextHref }: Props) {
  const router = useRouter();
  const Component = SETUP_COMPONENTS[quest.quest_identifier];

  const handleComplete = async () => {
    await completeAdventureQuest(quest.quest_identifier);
    if (nextHref) {
      router.push(nextHref);
    } else {
      // Final quest of chapter 0 — go to guild board
      router.push('/');
    }
  };

  if (!Component) {
    return <div className="text-muted">不明なセットアップクエストです。</div>;
  }

  return <Component quest={quest} onComplete={handleComplete} />;
}
