"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { useQuestStore } from '@/stores/questStore';

interface Props {
  onCancel: () => void;
}

const MASCOT_MESSAGES = [
  'マスコットが応援中…',
  'AIが魔法を詠唱中…',
  'もうすぐ完成するぞ…',
  'がんばれ～！',
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
      <div className="flex items-center justify-between font-dot-gothic">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-rpg-gold" />
          <h3 className="text-sm font-bold text-rpg-gold">クエスト実行中…</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="font-dot-gothic text-red-300">
          キャンセル
        </Button>
      </div>

      <RPGWindow variant="message">
        <div className="border-b border-blue-200/10 pb-2 mb-2">
          <TypewriterText
            text={MASCOT_MESSAGES[msgIdx]}
            speed={40}
            className="text-sm text-blue-200/70"
            showCursor={false}
            key={msgIdx}
          />
        </div>
        <div className="max-h-80 overflow-auto" ref={scrollRef}>
          {progress.map((m, i) => (
            <div key={i} className="mb-2">
              <span className="font-dot-gothic text-xs text-rpg-gold">
                &#x25B6; {m}
              </span>
            </div>
          ))}

          <pre className="whitespace-pre-wrap font-dot-gothic text-sm text-blue-100">{streamed || ''}</pre>
          {!streamed && (
            <div className="flex items-center gap-2 py-4 font-dot-gothic text-xs text-blue-200/40">
              <span className="animate-pulse">&#x25CF;</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>&#x25CF;</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>&#x25CF;</span>
              <span className="ml-1">詠唱中{dots}</span>
            </div>
          )}
        </div>
      </RPGWindow>
    </div>
  );
}
