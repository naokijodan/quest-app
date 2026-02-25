'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Terminal, CheckCircle, Circle, Download, ArrowRight, RefreshCw } from 'lucide-react';
import { useAgentConnection } from '@/features/quest/hooks/useAgentConnection';
import { useCliDetection } from '@/features/setup/hooks/useCliDetection';

export function CliSetupGuide() {
  const { cliList, hasAnyCli, checking, refreshHealth } = useCliDetection();
  const { status, connect, isConnected, agentVersion } = useAgentConnection();

  const statusLabel = (
    status === 'connected' ? '接続中' :
    status === 'connecting' ? '接続中…' :
    status === 'error' ? 'エラー' : '未接続'
  );

  const handleRecheck = async () => {
    await refreshHealth();
    if (status !== 'connected') {
      connect();
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle>Step 1: CLIツールのインストール</CardTitle>
            <CardDescription>
              少なくとも1つのCLIツールをインストールしてください。
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
        </CardHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cliList.map((cli) => (
            <div key={cli.command} className="rounded-lg border border-card-border bg-card-bg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cli.available ? (
                    <CheckCircle className="h-4 w-4 text-quest-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted" />
                  )}
                  <span className="font-medium text-foreground">{cli.name}</span>
                </div>
                <span className={cli.available ? 'text-xs text-quest-success' : 'text-xs text-muted'}>
                  {cli.available ? 'インストール済み' : '未インストール'}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">{cli.description}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Terminal className="h-4 w-4" />
                  <span>インストールコマンド</span>
                </div>
                <code className="block rounded bg-card-bg px-3 py-2 font-mono text-sm text-foreground border border-card-border">
                  {cli.installCommand}
                </code>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-1"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => {
                      navigator?.clipboard?.writeText(cli.installCommand).catch(() => {});
                    }}
                  >
                    コマンドをコピー
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!hasAnyCli && (
          <p className="mt-3 text-xs text-muted">
            いずれかのCLIをインストールすると自動的に検出されます（再チェックを押してください）。
          </p>
        )}
      </Card>

      {/* Step 2 */}
      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle>Step 2: Quest Agentの起動</CardTitle>
            <CardDescription>ターミナルでAgentを起動し、接続状態を確認します。</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className={isConnected ? 'text-xs text-quest-success' : status === 'error' ? 'text-xs text-quest-danger' : 'text-xs text-muted'}>
              {isConnected ? '接続済み' : `ステータス: ${statusLabel}`}
              {isConnected && agentVersion ? ` (v${agentVersion})` : ''}
            </span>
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
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Terminal className="h-4 w-4" />
            <span>起動コマンド</span>
          </div>
          <code className="block rounded bg-card-bg px-3 py-2 font-mono text-sm text-foreground border border-card-border">
            cd packages/quest-agent && npm run dev
          </code>
          <p className="text-xs text-muted">Agentが起動すると自動的に接続されます。</p>
        </div>
      </Card>

      {/* Step 3 */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: 準備完了！</CardTitle>
          <CardDescription>Agent接続とCLI準備が整えばスタートできます。</CardDescription>
        </CardHeader>
        <div className="flex items-center justify-between rounded-lg border border-card-border bg-card-bg p-4">
          <div className="flex items-center gap-3">
            {isConnected && hasAnyCli ? (
              <CheckCircle className="h-5 w-5 text-quest-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted" />
            )}
            <div>
              <div className={isConnected && hasAnyCli ? 'font-medium text-quest-success' : 'font-medium text-foreground'}>
                {isConnected && hasAnyCli ? '準備OK！クエストを開始できます。' : 'まだ準備中です。' }
              </div>
              {!isConnected && (
                <p className="text-xs text-muted">Quest Agentが未接続です。Step 2を確認してください。</p>
              )}
              {!hasAnyCli && (
                <p className="text-xs text-muted">CLIツールが検出されません。Step 1で少なくとも1つをインストールしてください。</p>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            className="shrink-0"
            disabled={!(isConnected && hasAnyCli)}
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => {
              if (!(isConnected && hasAnyCli)) return;
              window.location.href = '/';
            }}
          >
            ホームへ
          </Button>
        </div>
      </Card>
    </div>
  );
}
