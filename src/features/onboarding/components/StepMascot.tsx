'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';
import type { MascotType } from '@/types';

interface StepMascotProps {
  selected?: MascotType;
  onSelect: (value: MascotType) => void;
  onBack: () => void;
  onComplete: () => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

const MASCOTS: { key: MascotType; title: string; desc: string; sprite: string }[] = [
  { key: 'cat', title: 'ネコ', desc: '気まぐれだけど賢い', sprite: '/sprites/mascot-cat.png' },
  { key: 'dog', title: 'イヌ', desc: '忠実で元気いっぱい', sprite: '/sprites/mascot-cat-mage.png' },
];

export function StepMascot({ selected, onSelect, onBack, onComplete, loading, error }: StepMascotProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSelect(key: MascotType) {
    playSound('cursor');
    onSelect(key);
  }

  async function handleComplete() {
    setLocalError(null);
    if (!selected) {
      setLocalError('相棒を選択してください。');
      return;
    }
    playSound('confirm');
    await onComplete();
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
            相棒を選ぼう！
          </h2>
          <TypewriterText
            text="一緒に冒険する仲間を選んでください。"
            speed={30}
            className="mt-1 text-sm text-blue-200/60"
            showCursor={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MASCOTS.map((m) => {
            const active = selected === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => handleSelect(m.key)}
                className={
                  'rounded-lg border-2 p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 ' +
                  (active
                    ? 'border-rpg-gold bg-rpg-gold/10 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                    : 'border-blue-200/20 hover:border-rpg-gold/50 bg-blue-900/20')
                }
              >
                <div className="relative mx-auto mb-2 h-28 w-20">
                  <Image
                    src={m.sprite}
                    alt={m.title}
                    fill
                    className="object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    sizes="80px"
                  />
                </div>
                <div className="font-dot-gothic font-bold text-white">{m.title}</div>
                <div className="font-dot-gothic text-sm text-blue-200/60">{m.desc}</div>
                {active && (
                  <span className="mt-1 inline-block font-dot-gothic text-xs text-rpg-gold">
                    &#x25B6; 選択中
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {(error || localError) && (
          <div className="rpg-window mt-4 !p-2 text-sm text-red-300 font-dot-gothic">
            {error || localError}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={handleBack} disabled={!!loading} className="font-dot-gothic">
            &#x25C0; 戻る
          </Button>
          <Button onClick={handleComplete} loading={loading} disabled={!selected} aria-disabled={!selected} className="font-dot-gothic">
            &#x25B6; 完了
          </Button>
        </div>
      </RPGWindow>
    </div>
  );
}
