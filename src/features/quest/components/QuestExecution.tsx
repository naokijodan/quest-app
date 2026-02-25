"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { useQuestStore } from '@/stores/questStore';
import { Loader2 } from 'lucide-react';

interface Props {
  onCancel: () => void;
}

const MASCOT_MESSAGES = [
  'マスコットが応援中',
  'AIが考え中',
  'もうすぐ完成',
  'がんばれ～',
];

export function QuestExecution({ onCancel }: Props) {
  const streamed = useQuestStore((s) => s.streamedContent);
  const progress = useQuestStore((s) => s.progressMessages);
  const [dots, setDots] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [streamed]);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    const msgTimer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MASCOT_MESSAGES.length);
    }, 3000);
    return () => {
      clearInterval(dotTimer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-quest-primary" />
          <h3 className="text-sm font-semibold text-foreground">実行中…</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-quest-danger">
          キャンセル
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-quest-primary/20 bg-card-bg">
        <div className="border-b border-card-border bg-muted-bg/50 px-4 py-2">
          <span className="text-sm text-quest-primary font-medium">
            {MASCOT_MESSAGES[msgIdx]}{dots}
          </span>
        </div>
        <div className="max-h-80 overflow-auto p-4" ref={scrollRef}>
          {progress.map((m, i) => (
            <div key={i} className="mb-3">
              <div className="inline-block rounded-2xl bg-quest-info/10 px-3 py-1.5 text-xs text-quest-info">
                {m}
              </div>
            </div>
          ))}

          <pre className="whitespace-pre-wrap text-sm text-foreground">{streamed || ''}</pre>
          {!streamed && (
            <div className="flex items-center gap-2 py-4">
              <div className="h-2 w-2 rounded-full bg-quest-primary/60 animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-quest-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-2 w-2 rounded-full bg-quest-primary/20 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
