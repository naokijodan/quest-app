'use client';

import { useState, useCallback } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { playSound } from '@/lib/sound';
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
    playSound('cursor');
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      playSound('confirm');
    } catch {}
  }, []);

  if (runs.length === 0) {
    return (
      <RPGWindow className="text-center">
        <span className="mb-3 block text-3xl">&#x1F4DC;</span>
        <p className="font-dot-gothic text-sm font-bold text-white">まだクエストを実行していません</p>
        <p className="mt-1 font-dot-gothic text-xs text-blue-200/50">ギルドからクエストに挑戦しましょう！</p>
        <a href="/" className="mt-3 inline-block font-dot-gothic text-xs text-rpg-gold hover:text-white transition-colors">
          &#x25B6; ギルド掲示板へ
        </a>
      </RPGWindow>
    );
  }

  return (
    <div className="space-y-2">
      {runs.map((run) => {
        const isExpanded = expandedId === run.id;
        const output = run.output_data ?? run.partial_output ?? '';
        const date = new Date(run.started_at);
        const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        return (
          <RPGWindow key={run.id} variant="menu" className="transition-shadow hover:shadow-[0_0_16px_rgba(99,102,241,0.15)]">
            <button
              type="button"
              className="flex w-full items-center gap-3 text-left"
              onClick={() => toggleExpand(run.id)}
              aria-expanded={isExpanded}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200/20 bg-blue-900/30 text-base">
                {run.quest_icon}
              </span>
              <div className="min-w-0 flex-1 font-dot-gothic">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-white">
                    {run.quest_title}
                  </span>
                  <StatusBadge status={run.status} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-blue-200/50">
                  <span>{CATEGORY_LABELS[run.quest_category as QuestCategory]}</span>
                  <span>&#x00B7;</span>
                  <span>{dateStr}</span>
                  {run.status === 'completed' && (
                    <>
                      <span>&#x00B7;</span>
                      <span className="text-green-300">+{run.xp_reward} XP</span>
                    </>
                  )}
                </div>
              </div>
              <span className="shrink-0 font-dot-gothic text-blue-200/30">
                {isExpanded ? '\u25B2' : '\u25BC'}
              </span>
            </button>

            {isExpanded && output && (
              <div className="mt-3 border-t border-blue-200/10 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-dot-gothic text-xs text-blue-200/40">出力結果</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output)}
                    icon={<Copy className="h-3.5 w-3.5" />}
                    className="font-dot-gothic"
                  >
                    コピー
                  </Button>
                </div>
                <pre className="max-h-64 overflow-auto rounded-lg border border-blue-200/10 bg-blue-900/20 p-3 font-dot-gothic text-sm text-blue-100 whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}

            {isExpanded && run.status === 'failed' && run.error_message && (
              <div className="mt-3 border-t border-blue-200/10 pt-3">
                <p className="font-dot-gothic text-sm text-red-300">{run.error_message}</p>
              </div>
            )}
          </RPGWindow>
        );
      })}
    </div>
  );
}
