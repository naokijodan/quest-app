'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const STATS = [
  { label: 'さいだいHP', value: '+5', color: 'text-quest-success' },
  { label: 'さいだいMP', value: '+3', color: 'text-quest-info' },
  { label: 'こうげき力', value: '+2', color: 'text-quest-accent' },
];

const statVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function LevelUpModal({ newLevel }: Props) {
  const open = useUIStore((s) => s.showLevelUpModal);
  const setOpen = useUIStore((s) => s.setLevelUpModal);
  const [phase, setPhase] = useState<Phase>('flash');

  const unlockedCategories = LEVEL_UNLOCKS[newLevel] ?? [];
  const prevCategories = LEVEL_UNLOCKS[newLevel - 1] ?? [];
  const newCategories = unlockedCategories.filter(
    (c) => !prevCategories.includes(c)
  );

  useEffect(() => {
    if (!open) {
      setPhase('flash');
      return;
    }

    playSound('levelUp');

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('title'), 1200));
    timers.push(setTimeout(() => setPhase('stats'), 2800));

    const statsEnd = 2800 + STATS.length * 500 + 400;

    if (newCategories.length > 0) {
      timers.push(setTimeout(() => {
        setPhase('unlock');
        playSound('questComplete');
      }, statsEnd));
      timers.push(setTimeout(() => setPhase('done'), statsEnd + 1200));
    } else {
      timers.push(setTimeout(() => setPhase('done'), statsEnd));
    }

    return () => timers.forEach(clearTimeout);
  }, [open, newLevel, newCategories.length]);

  const handleClose = useCallback(() => {
    playSound('confirm');
    setOpen(false);
  }, [setOpen]);

  const phaseIndex = ['flash', 'title', 'stats', 'unlock', 'done'].indexOf(phase);

  return (
    <>
      <AnimatePresence>
        {open && phase === 'flash' && (
          <motion.div
            className="level-up-flash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <Modal open={open} onClose={handleClose}>
        <div className="relative text-center font-dot-gothic">
          {/* Sparkle decorations */}
          <motion.div
            className="absolute -top-2 left-4 text-quest-accent"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <motion.div
            className="absolute -top-1 right-6 text-quest-primary"
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Star className="h-4 w-4 fill-quest-primary" />
          </motion.div>
          <motion.div
            className="absolute top-8 -right-1 text-quest-accent"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>

          {/* Level number */}
          <AnimatePresence>
            {phaseIndex >= 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border-2 border-rpg-gold bg-blue-900/50">
                  <span className="text-3xl font-bold text-rpg-gold">
                    {newLevel}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typewriter title */}
          <AnimatePresence>
            {phaseIndex >= 1 && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <TypewriterText
                  text="レベルが あがった！"
                  speed={60}
                  className="text-xl font-bold text-white"
                  showCursor={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats reveal */}
          <AnimatePresence>
            {phaseIndex >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RPGWindow variant="message" className="mx-auto max-w-xs text-left mb-4">
                  <div className="space-y-1 text-sm">
                    {STATS.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        className="flex justify-between"
                        variants={statVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.5, duration: 0.4 }}
                        onAnimationComplete={() => {
                          if (i < STATS.length) playSound('xpGain');
                        }}
                      >
                        <span className="text-blue-200/70">{stat.label}</span>
                        <span className={`${stat.color} font-bold`}>{stat.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </RPGWindow>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New category unlock */}
          <AnimatePresence>
            {phaseIndex >= 3 && newCategories.length > 0 && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <RPGWindow variant="message" className="mx-auto max-w-xs">
                  <p className="mb-2 text-xs text-rpg-gold">
                    &#x2605; 新しいカテゴリが解放された！
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {newCategories.map((cat, i) => (
                      <motion.span
                        key={cat}
                        className="border border-rpg-gold/30 bg-rpg-gold/10 px-3 py-1 text-xs font-bold text-rpg-gold"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2, duration: 0.3 }}
                      >
                        {CATEGORY_LABELS[cat as QuestCategory] ?? cat}
                      </motion.span>
                    ))}
                  </div>
                </RPGWindow>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm button */}
          <AnimatePresence>
            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleClose}
                  className="rpg-window !px-8 !py-2 text-sm font-bold text-white hover:text-rpg-gold transition-colors"
                >
                  &#x25B6; つづける
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </>
  );
}
