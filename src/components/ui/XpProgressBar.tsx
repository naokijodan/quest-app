'use client';

import { xpToNextLevel } from '@/features/gamification/types';

interface XpProgressBarProps {
  xp: number;
  level: number;
}

export function XpProgressBar({ xp, level }: XpProgressBarProps) {
  const { current, next, progress } = xpToNextLevel(xp);
  const isMax = level >= 3;

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 sm:w-32">
        <div className="mb-0.5 flex items-center justify-between text-xs">
          <span className="text-muted">XP</span>
          <span className="text-muted">
            {isMax ? 'MAX' : `${current} / ${next}`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted-bg">
          <div
            className="h-full rounded-full bg-quest-primary transition-all duration-500"
            style={{ width: `${isMax ? 100 : Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

