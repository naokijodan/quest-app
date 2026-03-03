'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';
import type { UITheme } from '@/types';

interface StepThemeProps {
  selected?: UITheme;
  onSelect: (value: UITheme) => void;
  onNext: () => void;
  onBack: () => void;
}

const THEMES: { key: UITheme; title: string; desc: string; emoji: string }[] = [
  {
    key: 'classic',
    title: 'クラシックRPG',
    desc: 'ドラクエ風の青い画面',
    emoji: '⚔️',
  },
  {
    key: 'modern',
    title: 'モダンダーク',
    desc: 'スタイリッシュなガラス風',
    emoji: '🌙',
  },
  {
    key: 'pop',
    title: 'ポップ＆カラフル',
    desc: '明るく楽しいパステル調',
    emoji: '🌈',
  },
];

export function StepTheme({ selected, onSelect, onNext, onBack }: StepThemeProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSelect(key: UITheme) {
    playSound('cursor');
    onSelect(key);
    document.documentElement.setAttribute('data-theme', key);
  }

  function handleNext() {
    if (!selected) {
      setLocalError('テーマを選択してください。');
      return;
    }
    playSound('confirm');
    onNext();
  }

  function handleBack() {
    playSound('cancel');
    onBack();
  }

  return (
    <div className="w-full">
      <RPGWindow className="mb-4">
        <div className="mb-4">
          <h2 className="font-dot-gothic text-lg font-bold text-rpg-gold">
            画面デザインを選ぼう！
          </h2>
          <TypewriterText
            text="好みの見た目を選んでください。あとから変更もできます。"
            speed={30}
            className="mt-1 text-sm text-blue-200/60"
            showCursor={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {THEMES.map((t) => {
            const active = selected === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleSelect(t.key)}
                className={
                  'rounded-lg border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 ' +
                  (active
                    ? 'border-rpg-gold bg-rpg-gold/10 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                    : 'border-blue-200/20 hover:border-rpg-gold/50 bg-blue-900/20')
                }
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{t.emoji}</span>
                  <div className="flex-1">
                    <div className="font-dot-gothic font-bold text-foreground text-base">
                      {t.title}
                    </div>
                    <div className="font-dot-gothic text-sm text-muted">{t.desc}</div>
                  </div>
                  {active && (
                    <span className="font-dot-gothic text-xs text-rpg-gold">▶ 選択中</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {localError && (
          <div className="rpg-window mt-4 !p-2 text-sm text-red-300 font-dot-gothic">
            {localError}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={handleBack} className="font-dot-gothic">
            ◀ 戻る
          </Button>
          <Button onClick={handleNext} disabled={!selected} className="font-dot-gothic">
            ▶ 次へ
          </Button>
        </div>
      </RPGWindow>
    </div>
  );
}

