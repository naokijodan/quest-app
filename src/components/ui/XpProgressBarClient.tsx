'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { XpProgressBar } from '@/components/ui/XpProgressBar';
import { calculateLevel } from '@/features/gamification/types';

interface Props {
  initialXp: number;
  initialLevel: number;
}

export function XpProgressBarClient({ initialXp, initialLevel }: Props) {
  const storeUser = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (!storeUser) {
      setUser({
        id: '',
        username: '',
        avatar_type: 'planner',
        mascot_type: 'cat',
        experience_points: initialXp,
        level: initialLevel,
        quest_count: 0,
        onboarding_completed: true,
        unlocked_categories: [],
        adventure_chapter: 1,
        created_at: '',
        updated_at: '',
      });
    }
  }, [storeUser, setUser, initialXp, initialLevel]);

  const xp = storeUser?.experience_points ?? initialXp;
  const level = storeUser?.level ?? initialLevel;

  return <XpProgressBar xp={xp} level={level} />;
}
