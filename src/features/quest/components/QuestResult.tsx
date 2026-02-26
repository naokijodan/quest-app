"use client";

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Copy, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';
import { useQuestStore } from '@/stores/questStore';
import { useUIStore } from '@/stores/uiStore';
import { LevelUpModal } from '@/features/gamification/components/LevelUpModal';

interface Props {
  questRunId: string;
  xpGained: number;
  levelUp: boolean;
  newLevel?: number;
  onRetry?: () => void;
}

export function QuestResult({ questRunId, xpGained, levelUp, newLevel = 2, onRetry }: Props) {
  const content = useQuestStore((s) => s.streamedContent);
  const setLevelUpModal = useUIStore((s) => s.setLevelUpModal);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    playSound('questComplete');
    if (levelUp) setLevelUpModal(true);
  }, [levelUp, setLevelUpModal]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      playSound('confirm');
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [content]);

  return (
    <div className="page-enter space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 font-dot-gothic">
        <TypewriterText
          text="クエスト完了！"
          speed={60}
          className="text-sm font-bold text-rpg-gold"
          showCursor={false}
        />
        <div className="flex items-center gap-2">
          <span className="rounded border border-green-400/30 bg-green-900/30 px-2.5 py-1 text-xs font-bold text-green-300 glow-success">
            +{xpGained} XP
          </span>
          <Button variant="secondary" size="sm" onClick={handleCopy} icon={<Copy className="h-4 w-4" />} className="font-dot-gothic">
            {copied ? 'コピー済み' : 'コピー'}
          </Button>
        </div>
      </div>

      <RPGWindow variant="message">
        <div className="result-output whitespace-pre-wrap font-dot-gothic text-sm text-blue-100">
          {content}
        </div>
      </RPGWindow>

      <div className="flex flex-wrap items-center gap-3">
        {onRetry && (
          <Button onClick={() => { playSound('confirm'); onRetry(); }} icon={<Sparkles className="h-4 w-4" />} className="font-dot-gothic">
            &#x25B6; もう一度実行
          </Button>
        )}
        <Link href="/">
          <Button variant="ghost" icon={<Home className="h-4 w-4" />} className="font-dot-gothic">
            ギルドに戻る
          </Button>
        </Link>
      </div>

      <LevelUpModal newLevel={newLevel} />

      <input type="hidden" value={questRunId} readOnly />
    </div>
  );
}
