'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Circle, RefreshCw, ArrowRight } from 'lucide-react';
import { useCliDetection } from '@/features/setup/hooks/useCliDetection';
import { StoryDialog } from './StoryDialog';
import type { PresetQuest } from '@/types';

interface Props {
  quest: PresetQuest;
  onComplete: () => void;
}

export function SetupQuestWeaponCheck({ quest, onComplete }: Props) {
  const { cliList, hasAnyCli, checking, refreshHealth } = useCliDetection();
  const [showStory, setShowStory] = useState(true);

  return (
    <div className="space-y-6 page-enter">
      <StoryDialog
        open={showStory && !!quest.story_intro}
        text={quest.story_intro ?? ''}
        title="老賢者"
        onNext={() => setShowStory(false)}
      />

      <div className="rounded-xl border border-card-border parchment-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">武器（CLI）の状態</h2>
          <Button
            variant="secondary"
            size="sm"
            loading={checking}
            onClick={refreshHealth}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            再チェック
          </Button>
        </div>

        <div className="space-y-3">
          {cliList.map((cli) => (
            <div
              key={cli.command}
              className="flex items-center justify-between rounded-lg border border-card-border bg-background p-3"
            >
              <div className="flex items-center gap-3">
                {cli.available ? (
                  <CheckCircle className="h-5 w-5 text-quest-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted" />
                )}
                <div>
                  <span className="font-medium text-foreground">{cli.name}</span>
                  <p className="text-xs text-muted">{cli.description}</p>
                </div>
              </div>
              <span className={cli.available ? 'text-xs font-medium text-quest-success' : 'text-xs text-muted'}>
                {cli.available ? '検出済み' : '未検出'}
              </span>
            </div>
          ))}
        </div>

        {!hasAnyCli && (
          <p className="mt-4 text-sm text-muted">
            武器が見つからないようです。次のクエスト「武器を鍛える」で入手方法を確認できます。
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {hasAnyCli
            ? '武器の準備が整いました。次へ進みましょう。'
            : 'スキップして次へ進むこともできます。'}
        </div>
        <Button
          variant="primary"
          onClick={onComplete}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          {hasAnyCli ? '次へ進む' : 'スキップ'}
        </Button>
      </div>
    </div>
  );
}
