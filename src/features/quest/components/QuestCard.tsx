"use client";

import Link from 'next/link';
import { Lock, Star, ChevronRight } from 'lucide-react';
import type { PresetQuest } from '@/types';
import { cn } from '@/lib/utils/cn';
import { playSound } from '@/lib/sound';

interface Props {
  quest: PresetQuest;
  locked: boolean;
}

export function QuestCard({ quest, locked }: Props) {
  const handleClick = () => {
    if (!locked) {
      playSound('confirm');
    }
  };

  const content = (
    <div
      className={cn(
        'group relative border transition-all duration-200',
        locked
          ? 'opacity-50 border-blue-200/10 bg-blue-900/20'
          : 'border-blue-200/20 bg-blue-900/30 hover:border-blue-200/40 hover:bg-blue-900/50 hover:shadow-[0_0_12px_rgba(99,102,241,0.15)]'
      )}
    >
      {locked && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center fog-locked">
          <div className="relative z-20 flex items-center gap-1.5 border border-blue-200/20 bg-blue-900/60 px-2.5 py-0.5 text-xs text-blue-200/60 font-dot-gothic">
            <Lock className="h-3 w-3" /> Locked
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-200/20 bg-blue-900/50 text-foreground">
            <span aria-hidden className="text-base">{quest.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-white font-dot-gothic">
              {quest.title}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm text-blue-200/60">{quest.description}</p>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Difficulty stars */}
                <div className="flex items-center gap-0.5" aria-label={`難易度 ${quest.difficulty}`}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={cn('h-3 w-3', i < quest.difficulty ? 'fill-rpg-gold text-rpg-gold' : 'text-blue-200/20')} />
                  ))}
                </div>
                {/* XP reward */}
                <span className="font-dot-gothic text-xs font-bold text-rpg-gold">
                  +{quest.xp_reward}XP
                </span>
              </div>
              {!locked && (
                <span className="flex items-center gap-0.5 text-xs font-dot-gothic text-blue-200/40 opacity-0 transition-opacity group-hover:opacity-100">
                  &#x25B6; 受注 <ChevronRight className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (locked) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return (
    <Link href={`/quest/${quest.id}`} onClick={handleClick}>
      {content}
    </Link>
  );
}
