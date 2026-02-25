'use client';

import { useEffect, useRef } from 'react';
import { unlockAudio } from '@/lib/sound';

export function AudioUnlocker() {
  const unlocked = useRef(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!unlocked.current) {
        unlocked.current = true;
        unlockAudio();
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return null;
}
