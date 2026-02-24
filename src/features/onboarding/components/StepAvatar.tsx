'use client';

import { Button, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import type { AvatarType } from '@/types';

interface StepAvatarProps {
  selected?: AvatarType;
  onSelect: (value: AvatarType) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVATARS: { key: AvatarType; title: string; desc: string; emoji: string }[] = [
  { key: 'planner', title: 'プランナー', desc: '計画を立てるのが得意', emoji: '🧙‍♂️' },
  { key: 'explorer', title: 'エクスプローラー', desc: '好奇心旺盛な冒険家', emoji: '⚔️' },
  { key: 'crafter', title: 'クラフター', desc: 'ものづくりの達人', emoji: '🛠️' },
];

export function StepAvatar({ selected, onSelect, onNext, onBack }: StepAvatarProps) {
  return (
    <div className="w-full">
      <Card className="mb-4 bg-card-bg">
        <CardHeader className="mb-4">
          <CardTitle>キャラクタータイプを選ぼう！</CardTitle>
          <CardDescription>あなたのスタイルに近いタイプを選んでください。</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {AVATARS.map((a) => {
            const active = selected === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => onSelect(a.key)}
                className={
                  'rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 ' +
                  (active
                    ? 'border-quest-primary ring-quest-primary/50'
                    : 'border-card-border hover:border-quest-primary/60')
                }
              >
                <div className="mb-2 text-3xl">{a.emoji}</div>
                <div className="font-semibold text-foreground">{a.title}</div>
                <div className="text-sm text-muted">{a.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={onBack}>
            戻る
          </Button>
          <Button onClick={onNext} disabled={!selected} aria-disabled={!selected}>
            次へ
          </Button>
        </div>
      </Card>
    </div>
  );
}

