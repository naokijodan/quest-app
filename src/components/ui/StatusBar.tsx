'use client';

import { useUserStore } from '@/stores/userStore';
import { xpToNextLevel, LEVEL_THRESHOLDS } from '@/features/gamification/types';

interface Props {
  initialXp: number;
  initialLevel: number;
  username: string;
}

const TOTAL_SEGMENTS = 10;

export function StatusBar({ initialXp, initialLevel, username }: Props) {
  const storeUser = useUserStore((s) => s.user);
  const xp = storeUser?.experience_points ?? initialXp;
  const level = storeUser?.level ?? initialLevel;
  const name = storeUser?.username || username;
  const { current, next, progress } = xpToNextLevel(xp);

  const filledSegments = Math.round(progress * TOTAL_SEGMENTS);

  return (
    <div className="rpg-hud font-dot-gothic">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Username + Level */}
        <span className="text-sm sm:text-base text-rpg-gold font-bold tracking-wider">
          {name}
        </span>
        <span className="text-sm sm:text-base font-bold text-white">
          Lv.{level}
        </span>

        {/* XP Bar - Segment style */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-xs text-blue-300">XP</span>
          <div className="rpg-bar-segments w-20">
            {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
              <div
                key={i}
                className={`rpg-bar-segment ${
                  i < filledSegments ? 'rpg-bar-segment-filled text-quest-primary-light' : ''
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted">
            {current}/{next}
          </span>
        </div>
      </div>
    </div>
  );
}
