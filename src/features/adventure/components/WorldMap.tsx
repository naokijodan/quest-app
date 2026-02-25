"use client";

import Link from 'next/link';
import { CheckCircle2, Lock, MapPin } from 'lucide-react';
import type { Chapter } from '@/features/adventure/types';
import { cn } from '@/lib/utils/cn';

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

export function WorldMap({ chapters }: Props) {
  return (
    <div className="relative">
      {/* Map path line */}
      <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-quest-primary/40 via-quest-primary/20 to-card-border" />

      <div className="space-y-2">
        {chapters.map((data, index) => (
          <WorldMapNode key={data.chapter.number} data={data} isLast={index === chapters.length - 1} />
        ))}
      </div>
    </div>
  );
}

function WorldMapNode({ data, isLast }: { data: ChapterNodeData; isLast: boolean }) {
  const { chapter, locked, current, completed, href, totalQuests, completedQuests } = data;
  const progressPct = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  const content = (
    <div
      className={cn(
        'group relative flex items-start gap-4 rounded-xl border p-4 sm:p-5 transition-all duration-300 ml-12 sm:ml-14',
        locked
          ? 'border-card-border bg-card-bg/30 opacity-60'
          : completed
          ? 'border-quest-success/30 bg-card-bg hover:border-quest-success/50'
          : current
          ? 'border-quest-primary/50 bg-card-bg hover:border-quest-primary hover:shadow-lg hover:shadow-quest-primary/10'
          : 'border-card-border bg-card-bg hover:border-quest-primary/40 hover:shadow-lg'
      )}
    >
      {/* Fog overlay for locked */}
      {locked && (
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-background/60 to-background/40" />
      )}

      {/* Chapter info */}
      <div className="min-w-0 flex-1 relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl sm:text-2xl">{chapter.icon}</span>
          <h3 className={cn(
            'text-base sm:text-lg font-bold',
            locked ? 'text-muted' : 'text-foreground'
          )}>
            第{chapter.number}章: {chapter.title}
          </h3>
          <span className="rounded-md bg-muted-bg px-2 py-0.5 text-xs text-muted">
            {chapter.subtitle}
          </span>
        </div>
        <p className={cn('mt-1 text-sm', locked ? 'text-muted/60' : 'text-muted')}>
          {chapter.description}
        </p>

        {/* Progress bar (not locked) */}
        {totalQuests > 0 && !locked && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted">進捗</span>
              <span className={cn('font-medium', completed ? 'text-quest-success' : 'text-foreground')}>
                {completedQuests} / {totalQuests}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  completed ? 'bg-quest-success' : 'xp-bar-gradient'
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Status badges */}
        <div className="mt-2 flex items-center gap-2">
          {completed && (
            <span className="flex items-center gap-1 rounded-full bg-quest-success/10 px-2.5 py-0.5 text-xs font-medium text-quest-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> 完了
            </span>
          )}
          {current && !completed && (
            <span className="flex items-center gap-1 rounded-full bg-quest-primary/10 px-2.5 py-0.5 text-xs font-medium text-quest-primary">
              <MapPin className="h-3.5 w-3.5" /> 現在地
            </span>
          )}
          {locked && (
            <span className="relative z-10 flex items-center gap-1 rounded-full bg-muted-bg px-2.5 py-0.5 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" /> 要 Lv.{chapter.requiredLevel}
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
          'absolute left-4 sm:left-6 top-6 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2',
          locked
            ? 'border-card-border bg-background'
            : completed
            ? 'border-quest-success bg-quest-success'
            : current
            ? 'border-quest-primary bg-quest-primary map-node-current'
            : 'border-card-border bg-card-bg'
        )}
      >
        {completed && <CheckCircle2 className="h-3 w-3 text-background" />}
        {current && !completed && <div className="h-2 w-2 rounded-full bg-background" />}
      </div>

      {!locked && href ? (
        <Link href={href}>{content}</Link>
      ) : (
        content
      )}
    </div>
  );
}
