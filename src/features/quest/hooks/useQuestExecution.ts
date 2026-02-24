"use client";

import { useCallback, useRef, useState } from 'react';
import { getAgentClient } from '@/lib/agent';
import type { AgentResponse } from '@/lib/agent';
import { useQuestStore } from '@/stores/questStore';
import { useUIStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';

type Phase = 'idle' | 'executing' | 'completed' | 'error';

interface ExecuteResult {
  execute: (questId: string, inputs: Record<string, string>) => Promise<void>;
  cancel: () => void;
  phase: Phase;
  questRunId: string | null;
  xpGained: number;
  levelUp: boolean;
  error: string | null;
}

export function useQuestExecution(): ExecuteResult {
  // 状態管理は既存と同じ
  const [phase, setPhase] = useState<Phase>('idle');
  const [questRunId, setQuestRunId] = useState<string | null>(null);
  const [xpGained, setXPGained] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  // store selectors（既存と同じ）
  const startExecution = useQuestStore((s) => s.startExecution);
  const appendContent = useQuestStore((s) => s.appendContent);
  const addProgressMessage = useQuestStore((s) => s.addProgressMessage);
  const completeExecution = useQuestStore((s) => s.completeExecution);
  const failExecution = useQuestStore((s) => s.failExecution);
  const resetStore = useQuestStore((s) => s.reset);
  const showXPGainAnimation = useUIStore((s) => s.showXPGainAnimation);
  const setLevelUpModal = useUIStore((s) => s.setLevelUpModal);
  const showToast = useUIStore((s) => s.showToast);
  const incrementQuestCount = useUserStore((s) => s.incrementQuestCount);

  const cancel = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    failExecution('キャンセルしました');
    setError('キャンセルしました');
    setPhase('error');
  }, [failExecution]);

  const execute = useCallback(async (questId: string, inputs: Record<string, string>) => {
    resetStore();
    setError(null);
    setPhase('executing');
    setQuestRunId(null);
    setXPGained(0);
    setLevelUp(false);

    const client = getAgentClient();
    if (client.getStatus() !== 'connected') {
      const msg = 'Quest Agentに接続されていません。Agentを起動してください。';
      failExecution(msg);
      setError(msg);
      setPhase('error');
      showToast(msg, 'error');
      return;
    }

    // プロンプトを構築（inputsのキーバリューをテンプレートに埋め込む）
    const inputText = Object.entries(inputs)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const prompt = `以下のユーザー入力に基づいて、クエスト「${questId}」を実行してください。\n\n${inputText}`;

    try {
      const { requestId, cancel: agentCancel } = client.execute({
        cli_tool: 'claude',
        prompt,
        max_execution_time: 120,
        onEvent: (event: AgentResponse) => {
          switch (event.type) {
            case 'start':
              setQuestRunId(requestId);
              startExecution(requestId);
              break;
            case 'stdout':
              appendContent(event.content);
              break;
            case 'stderr':
              addProgressMessage(event.content);
              break;
            case 'progress':
              addProgressMessage(event.message);
              break;
            case 'complete': {
              completeExecution();
              incrementQuestCount();
              const xp = 10;
              setXPGained(xp);
              showXPGainAnimation(xp);
              setPhase('completed');
              cancelRef.current = null;
              break;
            }
            case 'error':
              failExecution(event.message);
              setError(event.message);
              showToast(event.message, 'error');
              setPhase('error');
              cancelRef.current = null;
              break;
          }
        },
      });
      cancelRef.current = agentCancel;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '実行エラーが発生しました';
      failExecution(msg);
      setError(msg);
      setPhase('error');
    }
  }, [resetStore, failExecution, startExecution, appendContent, addProgressMessage, completeExecution, incrementQuestCount, showXPGainAnimation, setLevelUpModal, showToast]);

  return { execute, cancel, phase, questRunId, xpGained, levelUp, error };
}
