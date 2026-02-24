"use client";

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Copy, Home, Sparkles, ArrowLeft } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useQuestStore } from '@/stores/questStore';
import { useUIStore } from '@/stores/uiStore';

interface Props {
  questRunId: string;
  xpGained: number;
  levelUp: boolean;
  onRetry?: () => void;
}

export function QuestResult({ questRunId, xpGained, levelUp, onRetry }: Props) {
  const content = useQuestStore((s) => s.streamedContent);
  const showLevelUpModal = useUIStore((s) => s.showLevelUpModal);
  const setLevelUpModal = useUIStore((s) => s.setLevelUpModal);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (levelUp) setLevelUpModal(true);
  }, [levelUp, setLevelUpModal]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [content]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-foreground">
          <ArrowLeft className="h-4 w-4 text-muted" />
          <span className="text-sm">結果</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-quest-success/10 px-2 py-1 text-xs font-medium text-quest-success">
            +{xpGained} XP
          </span>
          <Button variant="secondary" size="sm" onClick={handleCopy} icon={<Copy className="h-4 w-4" />}>
            {copied ? 'コピー済み' : '結果をコピー'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-card-border bg-card-bg p-4">
        <pre className="whitespace-pre-wrap text-sm text-foreground">{content}</pre>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} icon={<Sparkles className="h-4 w-4" />}>もう一度実行</Button>
        )}
        <Link href="/">
          <Button variant="ghost" icon={<Home className="h-4 w-4" />}>ホームに戻る</Button>
        </Link>
      </div>

      <Modal open={showLevelUpModal} onClose={() => setLevelUpModal(false)} title="レベルアップ！">
        <div className="space-y-3">
          <p className="text-sm text-foreground">おめでとうございます！新しいレベルに到達しました。</p>
          <div className="rounded-md bg-quest-primary/10 p-3 text-sm text-quest-primary">
            新しいカテゴリやクエストが解放されました！
          </div>
          <div className="text-right">
            <Button onClick={() => setLevelUpModal(false)}>OK</Button>
          </div>
        </div>
      </Modal>

      <input type="hidden" value={questRunId} readOnly />
    </div>
  );
}

