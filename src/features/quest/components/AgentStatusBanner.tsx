'use client';

import { useAgentConnection } from '@/features/quest/hooks/useAgentConnection';
import { Button } from '@/components/ui/Button';

export function AgentStatusBanner() {
  const { status, connect, agentVersion, availableTools } = useAgentConnection();

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-quest-success/30 bg-quest-success/10 px-4 py-3 text-sm text-quest-success">
        <span className="inline-block h-2 w-2 rounded-full bg-quest-success" />
        Agent接続中{agentVersion ? ` (v${agentVersion})` : ''}
        {availableTools.length > 0 && (
          <span className="ml-auto text-xs text-muted">
            {availableTools.join(', ')}
          </span>
        )}
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-quest-primary/30 bg-quest-primary/10 px-4 py-3 text-sm text-quest-primary">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-quest-primary" />
        Quest Agentに接続中...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-quest-danger/30 bg-quest-danger/10 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-quest-danger">
            <span className="inline-block h-2 w-2 rounded-full bg-quest-danger" />
            Agent接続エラー
          </div>
          <Button variant="secondary" size="sm" onClick={connect}>
            再接続
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Quest Agentが起動していることを確認してください。
        </p>
      </div>
    );
  }

  // disconnected
  return (
    <div className="rounded-lg border border-quest-accent/30 bg-quest-accent/10 px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-quest-accent">
          <span className="inline-block h-2 w-2 rounded-full bg-quest-accent" />
          Quest Agentが未接続です
        </div>
        <Button variant="secondary" size="sm" onClick={connect}>
          接続
        </Button>
      </div>
      <div className="mt-2 space-y-1 text-xs text-muted">
        <p>クエストを実行するにはQuest Agentの起動が必要です。</p>
        <p>ターミナルで以下を実行してください:</p>
        <code className="mt-1 block rounded bg-card-bg px-2 py-1 font-mono text-foreground">
          cd packages/quest-agent && npm run dev
        </code>
      </div>
    </div>
  );
}

