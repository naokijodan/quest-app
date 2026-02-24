"use client";

import { useCallback, useRef, useState } from 'react';
import type { QuestSSEEvent } from '@/types';
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
  const controllerRef = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [questRunId, setQuestRunId] = useState<string | null>(null);
  const [xpGained, setXPGained] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startExecution = useQuestStore((s) => s.startExecution);
  const appendContent = useQuestStore((s) => s.appendContent);
  const addProgressMessage = useQuestStore((s) => s.addProgressMessage);
  const completeExecution = useQuestStore((s) => s.completeExecution);
  const failExecution = useQuestStore((s) => s.failExecution);
  const resetStore = useQuestStore((s) => s.reset);

  const showXPGainAnimation = useUIStore((s) => s.showXPGainAnimation);
  const setLevelUpModal = useUIStore((s) => s.setLevelUpModal);
  const showToast = useUIStore((s) => s.showToast);

  const updateXP = useUserStore((s) => s.updateXP);
  const incrementQuestCount = useUserStore((s) => s.incrementQuestCount);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    failExecution('キャンセルしました');
    setError('キャンセルしました');
    setPhase('error');
  }, [failExecution]);

  const execute = useCallback(async (questId: string, inputs: Record<string, string>) => {
    // reset previous state
    resetStore();
    setError(null);
    setPhase('executing');
    setQuestRunId(null);
    setXPGained(0);
    setLevelUp(false);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch('/api/quest/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, inputs }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const msg = `実行に失敗しました (${response.status})`;
        failExecution(msg);
        setError(msg);
        setPhase('error');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const data = line.replace(/^data: /, '');
          if (!data) continue;
          const event: QuestSSEEvent = JSON.parse(data);
          switch (event.type) {
            case 'start':
              setQuestRunId(event.quest_run_id);
              startExecution(event.quest_run_id);
              break;
            case 'delta':
              appendContent(event.content);
              break;
            case 'progress':
              addProgressMessage(event.message);
              break;
            case 'complete':
              setQuestRunId(event.quest_run_id);
              setXPGained(event.xp_gained);
              setLevelUp(event.level_up);
              completeExecution();
              incrementQuestCount();
              // optimistic UI effects
              showXPGainAnimation(event.xp_gained);
              if (event.level_up) {
                setLevelUpModal(true);
              }
              setPhase('completed');
              break;
            case 'error':
              failExecution(event.message);
              setError(event.message);
              showToast(event.message, 'error');
              setPhase('error');
              break;
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '通信エラーが発生しました';
      failExecution(msg);
      setError(msg);
      setPhase('error');
    } finally {
      controllerRef.current = null;
    }
  }, [resetStore, failExecution, startExecution, appendContent, addProgressMessage, completeExecution, incrementQuestCount, showXPGainAnimation, setLevelUpModal, showToast]);

  return { execute, cancel, phase, questRunId, xpGained, levelUp, error };
}

