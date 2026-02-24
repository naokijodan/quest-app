'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function XpGainOverlay() {
  const show = useUIStore((s) => s.showXPGain);
  const amount = useUIStore((s) => s.xpGainAmount);
  const hide = useUIStore((s) => s.hideXPGain);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(hide, 1800);
      return () => clearTimeout(timer);
    }
  }, [show, hide]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="xp-float rounded-full bg-quest-success px-4 py-2 text-lg font-bold text-white shadow-lg">
        +{amount} XP
      </div>
    </div>
  );
}

