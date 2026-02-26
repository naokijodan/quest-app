'use client';

import { useMemo } from 'react';
import { Button, Input } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';

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

  function handleNext() {
    if (valid) {
      playSound('confirm');
      onNext();
    }
  }

  return (
    <div className="w-full">
      <RPGWindow className="mb-4">
        <div className="mb-4">
          <h2 className="font-dot-gothic text-base font-bold text-rpg-gold">
            冒険者の名前を決めよう！
          </h2>
          <TypewriterText
            text="後から変更できます。ユニークな名前を選びましょう。"
            speed={30}
            className="mt-1 text-xs text-blue-200/60"
            showCursor={false}
          />
        </div>
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
              onClick={handleNext}
              disabled={!valid}
              aria-disabled={!valid}
              className="font-dot-gothic"
            >
              &#x25B6; 次へ
            </Button>
          </div>
        </div>
      </RPGWindow>
    </div>
  );
}
