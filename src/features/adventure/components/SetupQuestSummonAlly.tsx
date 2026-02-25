'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Terminal, ArrowRight, CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { useAgentConnection } from '@/features/quest/hooks/useAgentConnection';
import { useCliDetection } from '@/features/setup/hooks/useCliDetection';
import { StoryDialog } from './StoryDialog';
import type { PresetQuest } from '@/types';

interface Props {
  quest: PresetQuest;
  onComplete: () => void;
}

export function SetupQuestSummonAlly({ quest, onComplete }: Props) {
  const { status, connect, isConnected, agentVersion } = useAgentConnection();
  const { hasAnyCli, checking, refreshHealth } = useCliDetection();
  const [showStory, setShowStory] = useState(true);

  const handleRecheck = async () => {
    await refreshHealth();
    if (status !== 'connected') {
      connect();
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <StoryDialog
        open={showStory && !!quest.story_intro}
        text={quest.story_intro ?? ''}
        title="魔術師"
        onNext={() => setShowStory(false)}
      />

      <div className="rounded-xl border border-card-border parchment-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">召喚の間 — 仲間を呼び出そう</h2>
          <Button
            variant="secondary"
            size="sm"
            loading={checking}
            onClick={handleRecheck}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            再チェック
          </Button>
        </div>

        <div className="space-y-4">
          {/* Agent status */}
          <div className="rounded-lg border border-card-border bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-quest-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted" />
                )}
                <div>
                  <span className="font-medium text-foreground">Quest Agent</span>
                  <p className="text-xs text-muted">クエスト実行の仲間</p>
                </div>
              </div>
              <span className={isConnected ? 'text-xs font-medium text-quest-success' : 'text-xs text-muted'}>
                {isConnected ? `接続済み${agentVersion ? ` (v${agentVersion})` : ''}` : '未接続'}
              </span>
            </div>
          </div>

          {/* Instructions */}
          {!isConnected && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                ターミナルで以下のコマンドを実行して、仲間を召喚してください。
              </p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <Terminal className="h-3.5 w-3.5" />
                <span>召喚の呪文</span>
              </div>
              <code className="block rounded bg-card-bg px-3 py-2 font-mono text-sm text-foreground border border-card-border">
                cd packages/quest-agent && npm run dev
              </code>
            </div>
          )}

          {/* Ready state */}
          {isConnected && hasAnyCli && (
            <div className="flex items-center gap-2 rounded-lg bg-quest-success/10 px-4 py-3 text-sm text-quest-success">
              <CheckCircle className="h-4 w-4" />
              仲間の召喚に成功。冒険の準備が整いました。
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {isConnected && hasAnyCli
            ? '全ての準備が整いました。ギルド掲示板へ！'
            : 'スキップしてギルド掲示板へ進むこともできます。'}
        </div>
        <Button
          variant="primary"
          onClick={onComplete}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          {isConnected && hasAnyCli ? 'ギルド掲示板へ' : 'スキップ'}
        </Button>
      </div>
    </div>
  );
}
