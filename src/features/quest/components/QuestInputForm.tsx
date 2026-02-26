"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PresetQuest, QuestInput as QuestInputType } from '@/types';
import { Button, Input, Textarea } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';
import { useQuestExecution } from '@/features/quest/hooks/useQuestExecution';
import { QuestExecution } from './QuestExecution';
import { QuestResult } from './QuestResult';

type Phase = 'input' | 'executing' | 'completed' | 'error';

interface Props { quest: PresetQuest }

const phaseVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

export function QuestInputForm({ quest }: Props) {
  const { execute, cancel, phase: execPhase, questRunId, xpGained, levelUp, error } = useQuestExecution();
  const [phase, setPhase] = useState<Phase>('input');
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(quest.required_inputs.map((i) => [i.name, '']))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const disabled = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const updateError = useCallback((field: QuestInputType, v: string): string => {
    const { validation } = field;
    if (validation?.required && !v.trim()) return '必須項目です';
    if (validation?.minLength && v.length < validation.minLength) return `${validation.minLength}文字以上で入力してください`;
    if (validation?.maxLength && v.length > validation.maxLength) return `${validation.maxLength}文字以内で入力してください`;
    return '';
  }, []);

  const handleChange = useCallback((field: QuestInputType, v: string) => {
    setValues((prev) => ({ ...prev, [field.name]: v }));
    setErrors((prev) => ({ ...prev, [field.name]: updateError(field, v) }));
  }, [updateError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    for (const f of quest.required_inputs) {
      newErrors[f.name] = updateError(f, values[f.name] ?? '');
    }
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) return;

    playSound('confirm');
    setPhase('executing');
    await execute(quest, values);
  }, [quest.id, quest.required_inputs, updateError, values, execute]);

  useEffect(() => {
    if (execPhase === 'executing') setPhase('executing');
    if (execPhase === 'completed') setPhase('completed');
    if (execPhase === 'error') setPhase('error');
  }, [execPhase]);

  const resetAll = useCallback(() => {
    setValues(Object.fromEntries(quest.required_inputs.map((i) => [i.name, ''])));
    setErrors({});
    setPhase('input');
  }, [quest.required_inputs]);

  return (
    <RPGWindow>
      <div className="mb-4 font-dot-gothic">
        <h2 className="text-sm font-bold text-rpg-gold">入力</h2>
        <TypewriterText
          text="必要な情報を入力して「クエスト実行！」を押してください。"
          speed={25}
          className="mt-1 text-xs text-blue-200/60"
          showCursor={false}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.div key="phase-input" variants={phaseVariants} initial="enter" animate="center" exit="exit">
            <form onSubmit={handleSubmit} className="space-y-4">
              {quest.required_inputs.map((field) => (
                <div key={field.name} className="space-y-1">
                  {field.type === 'text' && (
                    <Input
                      label={field.label}
                      placeholder={field.example || field.description}
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      error={errors[field.name]}
                      required={field.validation?.required}
                      minLength={field.validation?.minLength}
                      maxLength={field.validation?.maxLength}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      label={field.label}
                      placeholder={field.example || field.description}
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      error={errors[field.name]}
                      required={field.validation?.required}
                    />
                  )}
                  {field.type === 'select' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-dot-gothic text-sm font-medium text-blue-100">{field.label}</label>
                      <select
                        className="w-full rounded-lg border border-blue-200/20 bg-blue-900/30 px-3 py-2 font-dot-gothic text-sm text-white focus:border-rpg-gold focus:outline-none focus:ring-2 focus:ring-rpg-gold/20"
                        value={values[field.name] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                      >
                        <option value="" disabled>
                          選択してください
                        </option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors[field.name] && (
                        <p className="font-dot-gothic text-xs text-red-300">{errors[field.name]}</p>
                      )}
                    </div>
                  )}
                  {field.description && (
                    <p className="font-dot-gothic text-xs text-blue-200/40">{field.description}</p>
                  )}
                </div>
              ))}

              <div className="pt-2">
                <Button type="submit" size="lg" disabled={disabled} className="font-dot-gothic tracking-wider">
                  &#x25B6; クエスト実行！
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {phase === 'executing' && (
          <motion.div key="phase-executing" variants={phaseVariants} initial="enter" animate="center" exit="exit">
            <QuestExecution onCancel={cancel} />
          </motion.div>
        )}

        {phase === 'completed' && questRunId && (
          <motion.div key="phase-completed" variants={phaseVariants} initial="enter" animate="center" exit="exit">
            <QuestResult questRunId={questRunId} xpGained={xpGained} levelUp={levelUp} onRetry={resetAll} />
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="phase-error" variants={phaseVariants} initial="enter" animate="center" exit="exit">
            <div className="rpg-window !p-3 text-sm text-red-300 font-dot-gothic">
              {error || 'エラーが発生しました'}
              <div className="mt-3">
                <Button variant="secondary" onClick={resetAll} className="font-dot-gothic">&#x25C0; 戻る</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RPGWindow>
  );
}
