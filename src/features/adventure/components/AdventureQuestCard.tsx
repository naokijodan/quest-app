"use client";
import Link from 'next/link';
import type { AdventureProgress, PresetQuest } from '@/types';
import { Card } from '@/components/ui/Card';
import { Lock, CheckCircle2 } from 'lucide-react';

interface Props {
  quest: PresetQuest;
  chapter: number;
  progress: AdventureProgress | null;
}

export function AdventureQuestCard({ quest, chapter, progress }: Props) {
  const status = progress?.status ?? 'locked';
  const locked = status === 'locked';
  const completed = status === 'completed';
  const href = `/adventure/${chapter}/${encodeURIComponent(quest.quest_identifier)}`;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    locked ? <div className="cursor-not-allowed">{children}</div> : <Link href={href}>{children}</Link>;

  return (
    <Wrapper>
      <Card padding="md" className={locked ? 'opacity-60' : 'hover:border-quest-primary/40 transition-colors'}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-card-border bg-muted-bg text-foreground">
            <span aria-hidden className="text-lg">{quest.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">{quest.title}</h3>
              {completed && (
                <span className="flex items-center gap-1 rounded-md bg-quest-success/10 px-2 py-0.5 text-xs text-quest-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 完了
                </span>
              )}
              {locked && (
                <span className="flex items-center gap-1 rounded-md bg-muted-bg px-2 py-0.5 text-xs text-muted">
                  <Lock className="h-3.5 w-3.5" /> Locked
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-sm text-muted">{quest.description}</p>
          </div>
        </div>
      </Card>
    </Wrapper>
  );
}

