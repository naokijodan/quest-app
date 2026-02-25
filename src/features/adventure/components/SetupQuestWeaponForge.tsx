'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Terminal, Download, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useCliDetection } from '@/features/setup/hooks/useCliDetection';
import { StoryDialog } from './StoryDialog';
import type { PresetQuest } from '@/types';

interface Props {
  quest: PresetQuest;
  onComplete: () => void;
}

export function SetupQuestWeaponForge({ quest, onComplete }: Props) {
  const { cliList, hasAnyCli, checking, refreshHealth } = useCliDetection();
  const [showStory, setShowStory] = useState(true);

  return (
    <div className="space-y-6 page-enter">
      <StoryDialog
        open={showStory && !!quest.story_intro}
        text={quest.story_intro ?? ''}
        title="鍛冶師"
        onNext={() => setShowStory(false)}
      />

      <div className="rounded-xl border border-card-border parchment-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">鍛冶場 — 武器を鍛えよう</h2>
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

        <p className="mb-4 text-sm text-muted">
          以下のいずれかのCLIツールをインストールしてください。ターミナルを開いてコマンドをコピー＆ペーストするだけです。
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {cliList.map((cli) => (
            <div key={cli.command} className="rounded-lg border border-card-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-foreground">{cli.name}</span>
                {cli.available && (
                  <CheckCircle className="h-4 w-4 text-quest-success" />
                )}
              </div>
              <p className="mb-3 text-xs text-muted">{cli.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>インストール</span>
                </div>
                <code className="block rounded bg-card-bg px-3 py-2 font-mono text-xs text-foreground border border-card-border break-all">
                  {cli.installCommand}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="h-3.5 w-3.5" />}
                  onClick={() => {
                    navigator?.clipboard?.writeText(cli.installCommand).catch(() => {});
                  }}
                >
                  コピー
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hasAnyCli && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-quest-success/10 px-4 py-3 text-sm text-quest-success">
            <CheckCircle className="h-4 w-4" />
            武器の鍛造に成功しました。
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {hasAnyCli ? '準備完了。次へ進みましょう。' : 'スキップして後で設定することもできます。'}
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
