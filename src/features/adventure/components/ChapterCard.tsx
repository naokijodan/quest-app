"use client";
import Link from 'next/link';
import { CheckCircle2, Lock } from 'lucide-react';
import type { Chapter } from '@/features/adventure/types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

interface Props {
  chapter: Chapter;
  locked: boolean;
  current: boolean;
  completed: boolean;
  href?: string;
}

export function ChapterCard({ chapter, locked, current, completed, href }: Props) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    locked || !href ? (
      <div className="cursor-not-allowed">{children}</div>
    ) : (
      <Link href={href}>{children}</Link>
    );

  return (
    <Wrapper>
      <Card
        padding="lg"
        className={cn(
          'relative h-full transition-all duration-200',
          locked ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-0.5 hover:border-quest-primary/40',
          current && !locked ? 'border-quest-primary/50 glow-primary' : ''
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-card-border bg-muted-bg text-2xl">
            <span aria-hidden>{chapter.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-bold text-foreground">
                第{chapter.number}章 {chapter.title}
              </h3>
              <span className="rounded-md bg-muted-bg px-2 py-0.5 text-xs text-muted">
                {chapter.subtitle}
              </span>
              {current && (
                <span className="rounded-md bg-quest-primary/10 px-2 py-0.5 text-xs text-quest-primary">現在</span>
              )}
              {completed && (
                <span className="flex items-center gap-1 rounded-md bg-quest-success/10 px-2 py-0.5 text-xs text-quest-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 完了
                </span>
              )}
              {locked && (
                <span className="flex items-center gap-1 rounded-md bg-muted-bg px-2 py-0.5 text-xs text-muted">
                  <Lock className="h-3.5 w-3.5" /> 要Lv.{chapter.requiredLevel}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">{chapter.description}</p>
          </div>
        </div>
      </Card>
    </Wrapper>
  );
}

