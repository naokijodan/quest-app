"use client";

import { xpToNextLevel } from "@/features/gamification/types";

interface XpProgressBarProps {
  xp: number;
  level: number;
}

export function XpProgressBar({ xp, level }: XpProgressBarProps) {
  const { current, next, progress } = xpToNextLevel(xp);
  const isMax = level >= 10;
  const pct = isMax ? 100 : Math.round(progress * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 sm:w-32">
        <div className="mb-0.5 flex items-center justify-between text-xs">
          <span className="text-muted">XP</span>
          <span className="font-medium text-foreground">
            {isMax ? "MAX" : `${current} / ${next}`}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted-bg">
          <div
            className="xp-bar-gradient h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
