"use client";

import Link from 'next/link';
import { CheckCircle2, Lock, MapPin } from 'lucide-react';
import type { Chapter } from '@/features/adventure/types';
import { cn } from '@/lib/utils/cn';
import { playSound } from '@/lib/sound';

interface ChapterNodeData {
  chapter: Chapter;
  locked: boolean;
  current: boolean;
  completed: boolean;
  href?: string;
  totalQuests: number;
  completedQuests: number;
}

interface Props {
  chapters: ChapterNodeData[];
}

const TOTAL_SEGMENTS = 8;

export function WorldMap({ chapters }: Props) {
  return (
    <div className="relative">
      {/* Dotted path line (pixel art style) */}
      <div className="absolute left-6 sm:left-8 top-0 bottom-0 rpg-map-path" />

      <div className="space-y-3">
        {chapters.map((data, index) => (
          <WorldMapNode key={data.chapter.number} data={data} />
        ))}
      </div>
    </div>
  );
}

function WorldMapNode({ data }: { data: ChapterNodeData }) {
  const { chapter, locked, current, completed, href, totalQuests, completedQuests } = data;
  const progressPct = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const filledSegments = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * TOTAL_SEGMENTS) : 0;

  const content = (
    <div
      className={cn(
        'group relative ml-12 sm:ml-14 rpg-window !p-3 sm:!p-4 transition-all duration-300',
        locked && 'opacity-50',
        current && !completed && 'shadow-[inset_0_0_0_1px_var(--rpg-window-border-inner),0_0_0_3px_var(--rpg-window-bg-to),0_0_0_5px_var(--rpg-window-border),0_0_16px_rgba(99,102,241,0.3)]',
        completed && '!border-quest-success/50'
      )}
    >
      {/* Fog overlay for locked */}
      {locked && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/60 to-background/40" />
      )}

      {/* Chapter info */}
      <div className="min-w-0 flex-1 relative z-10 font-dot-gothic">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl sm:text-2xl">{chapter.icon}</span>
          <h3 className={cn(
            'text-sm sm:text-base font-bold',
            locked ? 'text-blue-200/40' : 'text-white'
          )}>
            第{chapter.number}章: {chapter.title}
          </h3>
          <span className="border border-blue-200/20 bg-blue-900/40 px-2 py-0.5 text-xs text-blue-200/50">
            {chapter.subtitle}
          </span>
        </div>
        <p className={cn('mt-1 text-xs', locked ? 'text-blue-200/30' : 'text-blue-200/60')}>
          {chapter.description}
        </p>

        {/* Progress bar - Segment style */}
        {totalQuests > 0 && !locked && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-blue-200/50">進捗</span>
              <span className={cn('font-bold', completed ? 'text-quest-success' : 'text-white')}>
                {completedQuests} / {totalQuests}
              </span>
            </div>
            <div className="rpg-bar-segments w-full">
              {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rpg-bar-segment',
                    i < filledSegments && 'rpg-bar-segment-filled',
                    i < filledSegments && (completed ? 'text-quest-success' : 'text-quest-primary-light')
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Status badges */}
        <div className="mt-2 flex items-center gap-2">
          {completed && (
            <span className="flex items-center gap-1 border border-quest-success/30 bg-quest-success/10 px-2 py-0.5 text-xs font-bold text-quest-success">
              <CheckCircle2 className="h-3 w-3" /> 完了
            </span>
          )}
          {current && !completed && (
            <span className="flex items-center gap-1 border border-quest-primary/30 bg-quest-primary/10 px-2 py-0.5 text-xs font-bold text-quest-primary">
              <MapPin className="h-3 w-3" /> 現在地
            </span>
          )}
          {locked && (
            <span className="relative z-10 flex items-center gap-1 border border-blue-200/20 bg-blue-900/40 px-2 py-0.5 text-xs text-blue-200/50">
              <Lock className="h-3 w-3" /> 要 Lv.{chapter.requiredLevel}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Map node dot */}
      <div
        className={cn(
          'absolute left-4 sm:left-6 top-5 z-10 flex h-5 w-5 items-center justify-center border-2 rpg-map-node-dot',
          locked
            ? 'border-blue-200/20 bg-background'
            : completed
            ? 'border-quest-success bg-quest-success'
            : current
            ? 'border-quest-primary bg-quest-primary map-node-current'
            : 'border-blue-200/30 bg-card-bg'
        )}
      >
        {completed && <CheckCircle2 className="h-3 w-3 text-background" />}
        {current && !completed && <div className="h-2 w-2 bg-background" />}
      </div>

      {!locked && href ? (
        <Link href={href} onClick={() => playSound('confirm')}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
