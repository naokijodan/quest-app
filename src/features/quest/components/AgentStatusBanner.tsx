'use client';

import { useAgentConnection } from '@/features/quest/hooks/useAgentConnection';
import { Button } from '@/components/ui/Button';
import { RPGWindow } from '@/components/ui/RPGWindow';
import Link from 'next/link';

export function AgentStatusBanner() {
  const { status, connect, agentVersion, availableTools } = useAgentConnection();

  if (status === 'connected') {
    return (
      <RPGWindow variant="status">
        <div className="flex items-center gap-2 font-dot-gothic text-sm text-green-300">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
          Agent接続中{agentVersion ? ` (v${agentVersion})` : ''}
          {availableTools.length > 0 && (
            <span className="ml-auto text-xs text-blue-200/40">
              {availableTools.join(', ')}
            </span>
          )}
        </div>
      </RPGWindow>
    );
  }

  if (status === 'connecting') {
    return (
      <RPGWindow variant="status">
        <div className="flex items-center gap-2 font-dot-gothic text-sm text-blue-200/70">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rpg-gold" />
          Quest Agentに接続中...
        </div>
      </RPGWindow>
    );
  }

  if (status === 'error') {
    return (
      <RPGWindow variant="status">
        <div className="font-dot-gothic text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-300">
              <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
              Agent接続エラー
            </div>
            <div className="flex items-center gap-3">
              <Link href="/setup" className="text-xs text-rpg-gold hover:text-white transition-colors">
                セットアップ →
              </Link>
              <Button variant="secondary" size="sm" onClick={connect} className="font-dot-gothic">
                再接続
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-200/40">
            Quest Agentが起動していることを確認してください。
          </p>
        </div>
      </RPGWindow>
    );
  }

  // disconnected
  return (
    <RPGWindow variant="status">
      <div className="font-dot-gothic text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rpg-gold">
            <span className="inline-block h-2 w-2 rounded-full bg-rpg-gold/60" />
            Quest Agentが未接続です
          </div>
          <div className="flex items-center gap-3">
            <Link href="/setup" className="text-xs text-rpg-gold hover:text-white transition-colors">
              セットアップ →
            </Link>
            <Button variant="secondary" size="sm" onClick={connect} className="font-dot-gothic">
              接続
            </Button>
          </div>
        </div>
        <div className="mt-2 space-y-1 text-xs text-blue-200/40">
          <p>クエストを実行するにはQuest Agentの起動が必要です。</p>
          <code className="mt-1 block rounded border border-blue-200/10 bg-blue-900/30 px-2 py-1 font-mono text-blue-100">
            cd packages/quest-agent && npm run dev
          </code>
        </div>
      </div>
    </RPGWindow>
  );
}
