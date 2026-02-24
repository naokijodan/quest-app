"use client";

import Link from 'next/link';
import { Lock, Star } from 'lucide-react';
import type { PresetQuest } from '@/types';
import { Card } from '@/components/ui';

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
      <Card
        padding="md"
        className={
          'relative h-full transition-shadow hover:shadow-md ' +
          (locked ? 'opacity-50' : 'hover:border-quest-primary/40')
        }
      >
        {locked && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/10">
            <div className="flex items-center gap-2 rounded-md border border-card-border bg-card-bg px-3 py-1 text-sm text-muted">
              <Lock className="h-4 w-4" /> Locked
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-card-border bg-muted-bg text-foreground">
            <span aria-hidden className="text-lg">{quest.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className="truncate text-base font-semibold text-foreground">
                {quest.title}
              </h3>
              <span className="shrink-0 rounded-md bg-quest-primary/10 px-2 py-0.5 text-xs font-medium text-quest-primary capitalize">
                {quest.category}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-muted">{quest.description}</p>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-quest-accent" aria-label={`難易度 ${quest.difficulty}`}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < quest.difficulty ? 'fill-quest-accent' : 'opacity-30'}`} />
                ))}
              </div>
              <div className="text-xs text-quest-success">+{quest.xp_reward} XP</div>
            </div>
          </div>
        </div>
      </Card>
    </Wrapper>
  );
}

