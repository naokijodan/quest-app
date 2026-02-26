'use client';

import { Button } from '@/components/ui/Button';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';
import { Terminal, CheckCircle, Circle, ArrowRight, RefreshCw } from 'lucide-react';
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
    playSound('cursor');
    await refreshHealth();
    if (status !== 'connected') {
      connect();
    }
  };

  return (
    <div className="space-y-4">
      {/* Step 1 */}
      <RPGWindow>
        <div className="flex items-start justify-between mb-4">
          <div className="font-dot-gothic">
            <h2 className="text-sm font-bold text-rpg-gold">Step 1: CLIツールのインストール</h2>
            <TypewriterText
              text="少なくとも1つのCLIツールを装備してください。"
              speed={25}
              className="mt-1 text-xs text-blue-200/50"
              showCursor={false}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            loading={checking}
            onClick={handleRecheck}
            icon={<RefreshCw className="h-4 w-4" />}
            className="font-dot-gothic shrink-0"
          >
            再チェック
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cliList.map((cli) => (
            <div key={cli.command} className={`rounded-lg border-2 p-4 transition-all ${cli.available ? 'border-green-400/30 bg-green-900/10' : 'border-blue-200/10 bg-blue-900/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-dot-gothic">
                  {cli.available ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-blue-200/30" />
                  )}
                  <span className="font-bold text-white text-sm">{cli.name}</span>
                </div>
                <span className={`font-dot-gothic text-[10px] ${cli.available ? 'text-green-300' : 'text-blue-200/40'}`}>
                  {cli.available ? '装備済み' : '未装備'}
                </span>
              </div>
              <p className="mt-2 font-dot-gothic text-xs text-blue-200/40">{cli.description}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 font-dot-gothic text-xs text-blue-200/50">
                  <Terminal className="h-3 w-3" />
                  <span>コマンド</span>
                </div>
                <code className="block rounded border border-blue-200/10 bg-blue-900/30 px-2 py-1.5 font-mono text-xs text-blue-100">
                  {cli.installCommand}
                </code>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-1 font-dot-gothic"
                  onClick={() => {
                    playSound('confirm');
                    navigator?.clipboard?.writeText(cli.installCommand).catch(() => {});
                  }}
                >
                  コピー
                </Button>
              </div>
            </div>
          ))}
        </div>
        {!hasAnyCli && (
          <p className="mt-3 font-dot-gothic text-xs text-blue-200/30">
            いずれかのCLIを装備すると自動的に検出されます。
          </p>
        )}
      </RPGWindow>

      {/* Step 2 */}
      <RPGWindow>
        <div className="flex items-start justify-between mb-4">
          <div className="font-dot-gothic">
            <h2 className="text-sm font-bold text-rpg-gold">Step 2: Quest Agentの起動</h2>
            <p className="mt-1 text-xs text-blue-200/50">ターミナルでAgentを起動し、接続状態を確認します。</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`font-dot-gothic text-[10px] ${isConnected ? 'text-green-300' : status === 'error' ? 'text-red-300' : 'text-blue-200/40'}`}>
              {isConnected ? '接続済み' : `${statusLabel}`}
              {isConnected && agentVersion ? ` (v${agentVersion})` : ''}
            </span>
            <Button
              variant="secondary"
              size="sm"
              loading={checking}
              onClick={handleRecheck}
              icon={<RefreshCw className="h-4 w-4" />}
              className="font-dot-gothic"
            >
              再チェック
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-dot-gothic text-xs text-blue-200/50">
            <Terminal className="h-3 w-3" />
            <span>起動コマンド</span>
          </div>
          <code className="block rounded border border-blue-200/10 bg-blue-900/30 px-3 py-2 font-mono text-sm text-blue-100">
            cd packages/quest-agent && npm run dev
          </code>
          <p className="font-dot-gothic text-xs text-blue-200/30">Agentが起動すると自動的に接続されます。</p>
        </div>
      </RPGWindow>

      {/* Step 3 */}
      <RPGWindow>
        <div className="font-dot-gothic mb-4">
          <h2 className="text-sm font-bold text-rpg-gold">Step 3: 準備完了！</h2>
          <p className="mt-1 text-xs text-blue-200/50">Agent接続とCLI装備が整えば冒険開始。</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border-2 p-4 transition-all ${isConnected && hasAnyCli ? 'border-green-400/30 bg-green-900/10' : 'border-blue-200/10 bg-blue-900/20'}">
          <div className="flex items-center gap-3 font-dot-gothic">
            {isConnected && hasAnyCli ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <Circle className="h-5 w-5 text-blue-200/30" />
            )}
            <div>
              <div className={`text-sm font-bold ${isConnected && hasAnyCli ? 'text-green-300' : 'text-white'}`}>
                {isConnected && hasAnyCli ? '準備OK！冒険を開始できます。' : 'まだ準備中…'}
              </div>
              {!isConnected && (
                <p className="text-xs text-blue-200/30">Quest Agentが未接続です。Step 2を確認してください。</p>
              )}
              {!hasAnyCli && (
                <p className="text-xs text-blue-200/30">CLIツールが検出されません。Step 1で装備してください。</p>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            className="shrink-0 font-dot-gothic"
            disabled={!(isConnected && hasAnyCli)}
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => {
              if (!(isConnected && hasAnyCli)) return;
              playSound('confirm');
              window.location.href = '/';
            }}
          >
            &#x25B6; ギルドへ
          </Button>
        </div>
      </RPGWindow>
    </div>
  );
}
