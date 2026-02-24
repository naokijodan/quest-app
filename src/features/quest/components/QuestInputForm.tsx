"use client";

import { useCallback, useMemo, useState } from 'react';
import type { PresetQuest, QuestInput as QuestInputType } from '@/types';
import { Button, Card, CardHeader, CardTitle, CardDescription, Input, Textarea } from '@/components/ui';
import { useQuestExecution } from '@/features/quest/hooks/useQuestExecution';
import { QuestExecution } from './QuestExecution';
import { QuestResult } from './QuestResult';

type Phase = 'input' | 'executing' | 'completed' | 'error';

interface Props { quest: PresetQuest }

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
    // final validation
    const newErrors: Record<string, string> = {};
    for (const f of quest.required_inputs) {
      newErrors[f.name] = updateError(f, values[f.name] ?? '');
    }
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) return;

    setPhase('executing');
    await execute(quest.id, values);
    // phase transitions will be handled by execPhase effect below
  }, [quest.id, quest.required_inputs, updateError, values, execute]);

  // reflect internal exec phase from hook
  useMemo(() => {
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
    <Card padding="lg">
      <CardHeader className="mb-6">
        <CardTitle>入力</CardTitle>
        <CardDescription>必要な情報を入力して「クエスト実行！」を押してください。</CardDescription>
      </CardHeader>

      {phase === 'input' && (
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
                  <label className="text-sm font-medium text-foreground">{field.label}</label>
                  <select
                    className="w-full rounded-lg border border-input-border bg-card-bg px-3 py-2 text-sm text-foreground focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-focus/20"
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
                    <p className="text-xs text-quest-danger">{errors[field.name]}</p>
                  )}
                </div>
              )}
              {field.description && (
                <p className="text-xs text-muted">{field.description}</p>
              )}
            </div>
          ))}

          <div className="pt-2">
            <Button type="submit" size="lg" disabled={disabled}>
              クエスト実行！
            </Button>
          </div>
        </form>
      )}

      {phase === 'executing' && <QuestExecution onCancel={cancel} />}

      {phase === 'completed' && questRunId && (
        <QuestResult questRunId={questRunId} xpGained={xpGained} levelUp={levelUp} onRetry={resetAll} />
      )}

      {phase === 'error' && (
        <div className="rounded-lg border border-quest-danger/30 bg-quest-danger/10 px-4 py-3 text-sm text-quest-danger">
          {error || 'エラーが発生しました'}
          <div className="mt-3">
            <Button variant="secondary" onClick={resetAll}>戻る</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

