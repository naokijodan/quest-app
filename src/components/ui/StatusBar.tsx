'use client';

import { useUserStore } from '@/stores/userStore';
import { xpToNextLevel } from '@/features/gamification/types';

interface Props {
  initialXp: number;
  initialLevel: number;
  username: string;
}

export function StatusBar({ initialXp, initialLevel, username }: Props) {
  const storeUser = useUserStore((s) => s.user);
  const xp = storeUser?.experience_points ?? initialXp;
  const level = storeUser?.level ?? initialLevel;
  const name = storeUser?.username || username;
  const { progress } = xpToNextLevel(xp);

  return (
    <div className="flex items-center gap-3">
      {/* Level Badge */}
      <div className="flex items-center gap-1.5 rounded-lg border border-quest-primary/30 bg-quest-primary/10 px-2.5 py-1">
        <span className="text-xs font-bold text-quest-primary-light">Lv.{level}</span>
      </div>

      {/* XP Bar */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="h-2 w-20 overflow-hidden rounded-full bg-card-border">
          <div
            className="h-full rounded-full xp-bar-gradient transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className="text-xs text-muted">{xp}XP</span>
      </div>

      {/* Username */}
      <span className="text-xs text-muted hidden sm:inline">{name}</span>
    </div>
  );
}
