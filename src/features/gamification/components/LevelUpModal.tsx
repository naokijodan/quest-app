'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { useUIStore } from '@/stores/uiStore';
import { LEVEL_UNLOCKS } from '@/features/gamification/types';
import { CATEGORY_LABELS } from '@/features/quest/constants/category';
import { playSound } from '@/lib/sound';
import type { QuestCategory } from '@/types';

interface Props {
  newLevel: number;
}

type Phase = 'flash' | 'title' | 'stats' | 'unlock' | 'done';

export function LevelUpModal({ newLevel }: Props) {
  const open = useUIStore((s) => s.showLevelUpModal);
  const setOpen = useUIStore((s) => s.setLevelUpModal);
  const [phase, setPhase] = useState<Phase>('flash');
  const [showStats, setShowStats] = useState<number[]>([]);

  const unlockedCategories = LEVEL_UNLOCKS[newLevel] ?? [];
  const prevCategories = LEVEL_UNLOCKS[newLevel - 1] ?? [];
  const newCategories = unlockedCategories.filter(
    (c) => !prevCategories.includes(c)
  );

  useEffect(() => {
    if (!open) {
      setPhase('flash');
      setShowStats([]);
      return;
    }

    // Phase sequence with RPG timing
    playSound('levelUp');

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Flash phase
    timers.push(setTimeout(() => setPhase('title'), 1200));

    // Title typewriter phase
    timers.push(setTimeout(() => setPhase('stats'), 2800));

    // Stats reveal - staggered
    const statsToReveal = [0, 1, 2]; // HP, MP, STR placeholder stats
    statsToReveal.forEach((statIndex, i) => {
      timers.push(setTimeout(() => {
        setShowStats((prev) => [...prev, statIndex]);
        playSound('xpGain');
      }, 3200 + i * 600));
    });

    // Unlock phase
    if (newCategories.length > 0) {
      timers.push(setTimeout(() => {
        setPhase('unlock');
        playSound('questComplete');
      }, 3200 + statsToReveal.length * 600 + 400));
    }

    // Done phase
    timers.push(setTimeout(() => setPhase('done'), 3200 + statsToReveal.length * 600 + (newCategories.length > 0 ? 1600 : 400)));

    return () => timers.forEach(clearTimeout);
  }, [open, newLevel, newCategories.length]);

  const handleClose = useCallback(() => {
    playSound('confirm');
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      {/* Full screen flash */}
      {open && phase === 'flash' && <div className="level-up-flash" />}

      <Modal open={open} onClose={handleClose}>
        <div className="relative text-center font-dot-gothic">
          {/* Sparkle decorations */}
          <div className="absolute -top-2 left-4 text-quest-accent sparkle-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="absolute -top-1 right-6 text-quest-primary sparkle-2">
            <Star className="h-4 w-4 fill-quest-primary" />
          </div>
          <div className="absolute top-8 -right-1 text-quest-accent sparkle-3">
            <Sparkles className="h-4 w-4" />
          </div>

          {/* Level number */}
          <div className={phase !== 'flash' ? 'level-up-bounce' : 'opacity-0'}>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border-2 border-rpg-gold bg-blue-900/50">
              <span className="text-3xl font-bold text-rpg-gold count-pop">
                {newLevel}
              </span>
            </div>
          </div>

          {/* Typewriter title */}
          {phase !== 'flash' && (
            <div className="mb-4">
              <TypewriterText
                text={`レベルが あがった！`}
                speed={60}
                className="text-xl font-bold text-white"
                showCursor={false}
              />
            </div>
          )}

          {/* Stats reveal */}
          {(phase === 'stats' || phase === 'unlock' || phase === 'done') && (
            <RPGWindow variant="message" className="mx-auto max-w-xs text-left mb-4">
              <div className="space-y-1 text-sm">
                {showStats.includes(0) && (
                  <div className="stat-reveal flex justify-between">
                    <span className="text-blue-200/70">さいだいHP</span>
                    <span className="text-quest-success font-bold">+5</span>
                  </div>
                )}
                {showStats.includes(1) && (
                  <div className="stat-reveal flex justify-between" style={{ animationDelay: '0.1s' }}>
                    <span className="text-blue-200/70">さいだいMP</span>
                    <span className="text-quest-info font-bold">+3</span>
                  </div>
                )}
                {showStats.includes(2) && (
                  <div className="stat-reveal flex justify-between" style={{ animationDelay: '0.2s' }}>
                    <span className="text-blue-200/70">こうげき力</span>
                    <span className="text-quest-accent font-bold">+2</span>
                  </div>
                )}
              </div>
            </RPGWindow>
          )}

          {/* New category unlock */}
          {(phase === 'unlock' || phase === 'done') && newCategories.length > 0 && (
            <div className="stat-reveal mb-4">
              <RPGWindow variant="message" className="mx-auto max-w-xs">
                <p className="mb-2 text-xs text-rpg-gold">
                  &#x2605; 新しいカテゴリが解放された！
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {newCategories.map((cat) => (
                    <span
                      key={cat}
                      className="border border-rpg-gold/30 bg-rpg-gold/10 px-3 py-1 text-xs font-bold text-rpg-gold"
                    >
                      {CATEGORY_LABELS[cat as QuestCategory] ?? cat}
                    </span>
                  ))}
                </div>
              </RPGWindow>
            </div>
          )}

          {/* Confirm button (RPG style) */}
          {phase === 'done' && (
            <div className="stat-reveal">
              <button
                onClick={handleClose}
                className="rpg-window !px-8 !py-2 text-sm font-bold text-white hover:text-rpg-gold transition-colors"
              >
                &#x25B6; つづける
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
