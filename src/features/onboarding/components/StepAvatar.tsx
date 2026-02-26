'use client';

import { Button } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';
import type { AvatarType } from '@/types';

interface StepAvatarProps {
  selected?: AvatarType;
  onSelect: (value: AvatarType) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVATARS: { key: AvatarType; title: string; desc: string; emoji: string }[] = [
  { key: 'planner', title: 'プランナー', desc: '計画を立てるのが得意', emoji: '\u{1F9D9}\u200D\u2642\uFE0F' },
  { key: 'explorer', title: 'エクスプローラー', desc: '好奇心旺盛な冒険家', emoji: '\u2694\uFE0F' },
  { key: 'crafter', title: 'クラフター', desc: 'ものづくりの達人', emoji: '\u{1F6E0}\uFE0F' },
];

export function StepAvatar({ selected, onSelect, onNext, onBack }: StepAvatarProps) {
  function handleSelect(key: AvatarType) {
    playSound('cursor');
    onSelect(key);
  }

  function handleNext() {
    if (selected) {
      playSound('confirm');
      onNext();
    }
  }

  function handleBack() {
    playSound('cancel');
    onBack();
  }

  return (
    <div className="w-full">
      <RPGWindow className="mb-4">
        <div className="mb-4">
          <h2 className="font-dot-gothic text-base font-bold text-rpg-gold">
            キャラクタータイプを選ぼう！
          </h2>
          <TypewriterText
            text="あなたのスタイルに近いタイプを選んでください。"
            speed={30}
            className="mt-1 text-xs text-blue-200/60"
            showCursor={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {AVATARS.map((a) => {
            const active = selected === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => handleSelect(a.key)}
                className={
                  'rounded-lg border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 ' +
                  (active
                    ? 'border-rpg-gold bg-rpg-gold/10 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                    : 'border-blue-200/20 hover:border-rpg-gold/50 bg-blue-900/20')
                }
              >
                <div className="mb-2 text-3xl">{a.emoji}</div>
                <div className="font-dot-gothic font-bold text-white text-sm">{a.title}</div>
                <div className="font-dot-gothic text-xs text-blue-200/60">{a.desc}</div>
                {active && (
                  <span className="mt-2 inline-block font-dot-gothic text-[10px] text-rpg-gold">
                    &#x25B6; 選択中
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={handleBack} className="font-dot-gothic">
            &#x25C0; 戻る
          </Button>
          <Button onClick={handleNext} disabled={!selected} aria-disabled={!selected} className="font-dot-gothic">
            &#x25B6; 次へ
          </Button>
        </div>
      </RPGWindow>
    </div>
  );
}
