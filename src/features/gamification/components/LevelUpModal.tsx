'use client';

import { useEffect, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { LEVEL_UNLOCKS } from '@/features/gamification/types';
import { CATEGORY_LABELS } from '@/features/quest/constants/category';
import type { QuestCategory } from '@/types';

interface Props {
  newLevel: number;
}

export function LevelUpModal({ newLevel }: Props) {
  const open = useUIStore((s) => s.showLevelUpModal);
  const setOpen = useUIStore((s) => s.setLevelUpModal);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
    setShowContent(false);
  }, [open]);

  const unlockedCategories = LEVEL_UNLOCKS[newLevel] ?? [];
  const prevCategories = LEVEL_UNLOCKS[newLevel - 1] ?? [];
  const newCategories = unlockedCategories.filter(
    (c) => !prevCategories.includes(c)
  );

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="relative text-center">
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

        <div className={showContent ? 'level-up-bounce' : ''}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-quest-primary/10 glow-primary">
            <span className="text-3xl font-bold text-quest-primary count-pop">
              {newLevel}
            </span>
          </div>
          <h2 className="mb-1 text-xl font-bold text-foreground">
            レベルアップ！
          </h2>
          <p className="text-sm text-muted">
            レベル {newLevel} に到達しました！
          </p>
        </div>

        {newCategories.length > 0 && (
          <div className="mt-4 rounded-lg bg-quest-primary/5 p-3">
            <p className="mb-2 text-xs font-medium text-quest-primary">
              新しいカテゴリが解放されました
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {newCategories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-quest-primary/10 px-3 py-1 text-sm font-medium text-quest-primary"
                >
                  {CATEGORY_LABELS[cat as QuestCategory] ?? cat}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <Button onClick={() => setOpen(false)} className="min-w-[120px]">
            やったー！
          </Button>
        </div>
      </div>
    </Modal>
  );
}

