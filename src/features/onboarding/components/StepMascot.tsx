'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import type { MascotType } from '@/types';

interface StepMascotProps {
  selected?: MascotType;
  onSelect: (value: MascotType) => void;
  onBack: () => void;
  onComplete: () => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

const MASCOTS: { key: MascotType; title: string; desc: string; emoji: string }[] = [
  { key: 'cat', title: 'ネコ', desc: '気まぐれだけど賢い', emoji: '🐱' },
  { key: 'dog', title: 'イヌ', desc: '忠実で元気いっぱい', emoji: '🐶' },
];

export function StepMascot({ selected, onSelect, onBack, onComplete, loading, error }: StepMascotProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleComplete() {
    setLocalError(null);
    if (!selected) {
      setLocalError('相棒を選択してください。');
      return;
    }
    await onComplete();
  }

  return (
    <div className="w-full">
      <Card className="mb-4 bg-card-bg">
        <CardHeader className="mb-4">
          <CardTitle>相棒を選ぼう！</CardTitle>
          <CardDescription>一緒に冒険する仲間を選んでください。</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MASCOTS.map((m) => {
            const active = selected === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onSelect(m.key)}
                className={
                  'rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 ' +
                  (active
                    ? 'border-quest-primary ring-quest-primary/50'
                    : 'border-card-border hover:border-quest-primary/60')
                }
              >
                <div className="mb-2 text-3xl">{m.emoji}</div>
                <div className="font-semibold text-foreground">{m.title}</div>
                <div className="text-sm text-muted">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {(error || localError) && (
          <div className="mt-4 rounded-lg border border-quest-danger/30 bg-quest-danger/10 px-3 py-2 text-sm text-quest-danger">
            {error || localError}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={onBack} disabled={!!loading}>
            戻る
          </Button>
          <Button onClick={handleComplete} loading={loading} disabled={!selected} aria-disabled={!selected}>
            完了
          </Button>
        </div>
      </Card>
    </div>
  );
}

