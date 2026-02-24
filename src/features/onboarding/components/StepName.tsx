'use client';

import { useMemo } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, Input } from '@/components/ui';

interface StepNameProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function StepName({ value, onChange, onNext }: StepNameProps) {
  const { error, valid } = useMemo(() => {
    if (!value) return { error: '2〜30文字で入力してください。', valid: false };
    if (value.length < 2) return { error: '2文字以上で入力してください。', valid: false };
    if (value.length > 30) return { error: '30文字以内で入力してください。', valid: false };
    if (!/^[a-zA-Z0-9_-]+$/.test(value))
      return { error: '英数字・ハイフン・アンダースコアのみ使用できます。', valid: false };
    return { error: undefined, valid: true };
  }, [value]);

  return (
    <div className="w-full">
      <Card className="mb-4 bg-card-bg">
        <CardHeader className="mb-2">
          <CardTitle>冒険者の名前を決めよう！</CardTitle>
          <CardDescription>後から変更できます。ユニークな名前を選びましょう。</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Input
            label="ユーザー名"
            placeholder="quester_123"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={error}
            autoFocus
          />
          <div className="flex justify-end">
            <Button
              onClick={onNext}
              disabled={!valid}
              aria-disabled={!valid}
            >
              次へ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

