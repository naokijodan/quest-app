"use client";

import { useCallback, useRef, useState } from 'react';
import { getAgentClient } from '@/lib/agent';
import type { AgentResponse, AgentCompleteEvent } from '@/lib/agent';
import { renderTemplate } from '@/lib/utils/template';
import { completeQuestRun } from '@/features/quest/actions/complete-quest';
import type { PresetQuest } from '@/types';
import { useQuestStore } from '@/stores/questStore';
import { useUIStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';

type Phase = 'idle' | 'executing' | 'completed' | 'error';

interface ExecuteResult {
  execute: (quest: PresetQuest, inputs: Record<string, string>) => Promise<void>;
  cancel: () => void;
  phase: Phase;
  questRunId: string | null;
  xpGained: number;
  levelUp: boolean;
  error: string | null;
}

export function useQuestExecution(): ExecuteResult {
  const [phase, setPhase] = useState<Phase>('idle');
  const [questRunId, setQuestRunId] = useState<string | null>(null);
  const [xpGained, setXPGained] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const outputRef = useRef<string>('');

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
    cancelRef.current?.();
    cancelRef.current = null;
    failExecution('キャンセルしました');
    setError('キャンセルしました');
    setPhase('error');
  }, [failExecution]);

  const execute = useCallback(async (quest: PresetQuest, inputs: Record<string, string>) => {
    resetStore();
    setError(null);
    setPhase('executing');
    setQuestRunId(null);
    setXPGained(0);
    setLevelUp(false);
    outputRef.current = '';

    const client = getAgentClient();
    if (client.getStatus() !== 'connected') {
      const msg = 'Quest Agentに接続されていません。Agentを起動してください。';
      failExecution(msg);
      setError(msg);
      setPhase('error');
      showToast(msg, 'error');
      return;
    }

    // Build prompt from cli_prompt_template (falls back to prompt_template)
    const template = quest.cli_prompt_template ?? quest.prompt_template;
    const prompt = renderTemplate(template, inputs);

    try {
      const { requestId, cancel: agentCancel } = client.execute({
        cli_tool: quest.cli_tool ?? 'claude',
        prompt,
        allowed_commands: quest.allowed_commands ?? [],
        working_directory: quest.working_directory ?? 'sandbox',
        max_execution_time: quest.max_execution_time ?? 120,
        requires_approval: quest.requires_approval ?? false,
        onEvent: async (event: AgentResponse) => {
          switch (event.type) {
            case 'start':
              setQuestRunId(requestId);
              startExecution(requestId);
              break;
            case 'stdout':
              outputRef.current += event.content;
              appendContent(event.content);
              break;
            case 'stderr':
              addProgressMessage(event.content);
              break;
            case 'progress':
              addProgressMessage(event.message);
              break;
            case 'complete': {
              // Use complete event's output as fallback when stdout streaming missed data
              const completeEvent = event as AgentCompleteEvent;
              if (!outputRef.current && completeEvent.output) {
                outputRef.current = completeEvent.output;
                appendContent(completeEvent.output);
              }

              // Check for non-zero exit code with empty output (CLI failure)
              if (completeEvent.exit_code !== 0 && !outputRef.current) {
                const msg = `CLIがエラーで終了しました (exit code: ${completeEvent.exit_code})`;
                failExecution(msg);
                setError(msg);
                showToast(msg, 'error');
                setPhase('error');
                cancelRef.current = null;
                break;
              }

              completeExecution();

              // Call Server Action for XP calculation and DB update
              const result = await completeQuestRun({
                preset_quest_id: quest.id,
                input_data: inputs,
                output_data: outputRef.current,
              });

              if (result.success) {
                setQuestRunId(result.quest_run_id);
                setXPGained(result.xp_gained);
                setLevelUp(result.level_up);
                showXPGainAnimation(result.xp_gained);
                updateXP(result.xp_gained, result.new_level);
                incrementQuestCount();
                if (result.level_up) {
                  setLevelUpModal(true);
                }
              } else {
                showToast(result.error ?? 'XP更新に失敗しました', 'error');
              }

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
  }, [resetStore, failExecution, startExecution, appendContent, addProgressMessage, completeExecution, showXPGainAnimation, setLevelUpModal, showToast, updateXP, incrementQuestCount]);

  return { execute, cancel, phase, questRunId, xpGained, levelUp, error };
}
