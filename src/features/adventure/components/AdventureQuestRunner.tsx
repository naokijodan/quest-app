"use client";
import { useEffect, useMemo, useState } from 'react';
import type { PresetQuest } from '@/types';
import { Terminal } from '@/components/ui/Terminal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NPCDialog } from '@/components/ui/NPCDialog';
import { StoryDialog } from './StoryDialog';
import { BossVictory } from './BossVictory';
import { useQuestExecution } from '@/features/quest/hooks/useQuestExecution';
import { useQuestStore } from '@/stores/questStore';
import { useUserStore } from '@/stores/userStore';
import { completeAdventureQuest } from '@/features/adventure/actions';

interface Props {
  quest: PresetQuest;
}

export function AdventureQuestRunner({ quest }: Props) {
  const { execute, cancel, phase, xpGained, levelUp } = useQuestExecution();
  const streamed = useQuestStore((s) => s.streamedContent);
  const progress = useQuestStore((s) => s.progressMessages);
  const username = useUserStore((s) => s.user?.username ?? 'プレイヤー');

  const [showIntro, setShowIntro] = useState<boolean>(!!quest.story_intro);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [showBossVictory, setShowBossVictory] = useState<boolean>(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const hasInputs = (quest.required_inputs?.length ?? 0) > 0;
  const allInputsFilled = !hasInputs || quest.required_inputs.every((input) => {
    if (!input.validation?.required) return true;
    const val = inputs[input.name]?.trim() ?? '';
    return val.length > 0;
  });

  // Build terminal lines from store
  const terminalLines = useMemo(() => {
    const lines: { type: 'command' | 'output' | 'system' | 'error'; content: string }[] = [];
    if (quest.terminal_command) {
      lines.push({ type: 'system', content: `ヒント: 次のコマンドを試してみよう → ${quest.terminal_command}` });
    }
    for (const m of progress) {
      lines.push({ type: 'system', content: m });
    }
    if (streamed) {
      const parts = streamed.split('\n');
      for (const p of parts) {
        lines.push({ type: 'output', content: p });
      }
    }
    return lines;
  }, [progress, streamed, quest.terminal_command]);

  // On completion, show story_complete (or boss victory) and mark adventure progress
  useEffect(() => {
    if (phase === 'completed') {
      const isFinalBoss = quest.quest_identifier === 'adv-5-2';
      if (isFinalBoss) {
        setShowBossVictory(true);
      } else if (quest.story_complete) {
        setShowComplete(true);
      }
      // Update adventure progress in background
      (async () => {
        await completeAdventureQuest(quest.quest_identifier);
      })();
    }
  }, [phase, quest.quest_identifier, quest.story_complete]);

  const onStart = () => {
    execute(quest, inputs);
  };

  return (
    <div className="space-y-4">
      <BossVictory
        open={showBossVictory}
        onClose={() => setShowBossVictory(false)}
        username={username}
      />
      <StoryDialog
        open={showIntro}
        text={quest.story_intro ?? ''}
        title="プロローグ"
        onNext={() => {
          setShowIntro(false);
          // Auto-start only when there are no required inputs
          if (!hasInputs) {
            onStart();
          }
        }}
      />

      {/* Show completion dialog only when not final boss */}
      {!showBossVictory && (
        <StoryDialog
          open={showComplete}
          text={quest.story_complete ?? ''}
          title="エピローグ"
          onNext={() => setShowComplete(false)}
        />
      )}

      {/* Wizard completion message */}
      {phase === 'completed' && !showBossVictory && (
        <NPCDialog
          character="wizard"
          message={levelUp
            ? `見事じゃ！レベルアップしたぞ！+${xpGained} XP 獲得！`
            : `よくやった！+${xpGained} XP 獲得じゃ。次の依頼に挑むがよい。`}
          npcName="導きの魔法使い"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {phase === 'idle' && '準備完了。実行を開始できます。'}
          {phase === 'executing' && '実行中...'}
          {phase === 'completed' && `完了！ +${xpGained} XP ${levelUp ? '(レベルアップ!)' : ''}`}
        </div>
        <div className="flex items-center gap-2">
          {phase === 'idle' && !showIntro && !hasInputs && (
            <Button onClick={onStart}>実行開始</Button>
          )}
          {phase === 'executing' && (
            <Button variant="secondary" onClick={cancel} className="text-quest-danger">
              キャンセル
            </Button>
          )}
        </div>
      </div>

      {hasInputs && phase === 'idle' && !showIntro && (
        <div className="space-y-3 rounded-lg border border-card-border bg-card-bg p-4">
          {quest.required_inputs.map((input) => (
            <div key={input.name}>
              <label className="mb-1 block text-sm font-medium text-foreground">{input.label}</label>
              <p className="mb-2 text-xs text-muted">{input.description}</p>
              <Input
                value={inputs[input.name] ?? ''}
                onChange={(e) => setInputs((prev) => ({ ...prev, [input.name]: e.target.value }))}
                placeholder={input.example}
              />
            </div>
          ))}
          <Button onClick={onStart} disabled={!allInputsFilled}>
            実行開始
          </Button>
        </div>
      )}

      <Terminal lines={terminalLines} typingEffect className="h-96" />
    </div>
  );
}
