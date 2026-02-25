'use client';

import { useState, useCallback } from 'react';
import { Copy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import { CATEGORY_LABELS } from '@/features/quest/constants/category';
import type { QuestRunWithQuest } from '@/features/quest/actions';
import type { QuestCategory } from '@/types';

interface Props {
  runs: QuestRunWithQuest[];
}

export function HistoryList({ runs }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }, []);

  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-card-border bg-card-bg p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted-bg float-gentle">
          <Sparkles className="h-8 w-8 text-quest-primary/40" />
        </div>
        <p className="text-lg font-medium text-foreground">まだクエストを実行していません</p>
        <p className="mt-1 text-sm text-muted">ホームからクエストに挑戦しましょう！</p>
        <a href="/" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-quest-primary hover:underline">
          クエスト一覧へ →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => {
        const isExpanded = expandedId === run.id;
        const output = run.output_data ?? run.partial_output ?? '';
        const date = new Date(run.started_at);
        const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        return (
          <Card key={run.id} padding="sm" className="transition-shadow hover:shadow-md">
            <button
              type="button"
              className="flex w-full items-center gap-3 text-left"
              onClick={() => toggleExpand(run.id)}
              aria-expanded={isExpanded}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-border bg-muted-bg text-base">
                {run.quest_icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {run.quest_title}
                  </span>
                  <StatusBadge status={run.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{CATEGORY_LABELS[run.quest_category as QuestCategory]}</span>
                  <span>·</span>
                  <span>{dateStr}</span>
                  {run.status === 'completed' && (
                    <>
                      <span>·</span>
                      <span className="text-quest-success">+{run.xp_reward} XP</span>
                    </>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-muted">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>

            {isExpanded && output && (
              <div className="mt-3 border-t border-card-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">出力結果</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output)}
                    icon={<Copy className="h-3.5 w-3.5" />}
                  >
                    コピー
                  </Button>
                </div>
                <pre className="max-h-64 overflow-auto rounded-lg bg-muted-bg p-3 text-sm text-foreground whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}

            {isExpanded && run.status === 'failed' && run.error_message && (
              <div className="mt-3 border-t border-card-border pt-3">
                <p className="text-sm text-quest-danger">{run.error_message}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

