"use client";

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { useQuestStore } from '@/stores/questStore';

interface Props {
  onCancel: () => void;
}

export function QuestExecution({ onCancel }: Props) {
  const streamed = useQuestStore((s) => s.streamedContent);
  const progress = useQuestStore((s) => s.progressMessages);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [streamed]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">実行中…</h3>
        <Button variant="ghost" onClick={onCancel} className="text-quest-danger">
          キャンセル
        </Button>
      </div>

      <div className="relative rounded-lg border border-card-border bg-card-bg">
        <div className="absolute left-4 top-4 animate-pulse text-sm text-muted">
          マスコットが応援中…
        </div>
        <div className="max-h-80 overflow-auto p-4 pt-10" ref={scrollRef}>
          {progress.map((m, i) => (
            <div key={i} className="mb-3">
              <div className="inline-block rounded-2xl bg-quest-info/10 px-3 py-1.5 text-xs text-quest-info">
                {m}
              </div>
            </div>
          ))}

          <pre className="whitespace-pre-wrap text-sm text-foreground">{streamed || '…'}</pre>
        </div>
      </div>
    </div>
  );
}

