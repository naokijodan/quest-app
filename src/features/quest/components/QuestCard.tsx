"use client";

import Link from 'next/link';
import { Lock, Star, ChevronRight } from 'lucide-react';
import type { PresetQuest } from '@/types';
import { cn } from '@/lib/utils/cn';

interface Props {
  quest: PresetQuest;
  locked: boolean;
}

export function QuestCard({ quest, locked }: Props) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    locked ? (
      <div className="cursor-not-allowed">{children}</div>
    ) : (
      <Link href={`/quest/${quest.id}`}>{children}</Link>
    );

  return (
    <Wrapper>
      <div
        className={cn(
          'group relative rounded-xl border transition-all duration-200 parchment-card',
          locked
            ? 'opacity-50 border-card-border'
            : 'hover:shadow-lg hover:shadow-quest-primary/10 hover:-translate-y-0.5 hover:border-quest-primary/40'
        )}
      >
        {locked && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl fog-locked">
            <div className="relative z-20 flex items-center gap-2 rounded-md border border-card-border bg-card-bg px-3 py-1 text-sm text-muted">
              <Lock className="h-4 w-4" /> Locked
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-card-border bg-background text-foreground">
              <span aria-hidden className="text-lg">{quest.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-foreground">
                {quest.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{quest.description}</p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Difficulty stars */}
                  <div className="flex items-center gap-0.5" aria-label={`難易度 ${quest.difficulty}`}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star key={i} className={cn('h-3.5 w-3.5', i < quest.difficulty ? 'fill-rpg-gold text-rpg-gold' : 'text-card-border')} />
                    ))}
                  </div>
                  {/* XP reward - gold coin style */}
                  <span className="flex items-center gap-1 rounded-full bg-quest-accent/10 px-2 py-0.5 text-xs font-bold text-quest-accent">
                    +{quest.xp_reward} XP
                  </span>
                </div>
                {!locked && (
                  <span className="flex items-center gap-1 text-xs font-medium text-quest-primary opacity-0 transition-opacity group-hover:opacity-100">
                    受注する <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
