'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleMute, isMuted } from '@/lib/sound';

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
  }, []);

  const handleToggle = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex h-7 w-7 items-center justify-center rounded text-blue-200/60 hover:text-white transition-colors"
      aria-label={muted ? 'サウンドON' : 'サウンドOFF'}
      title={muted ? 'サウンドON' : 'サウンドOFF'}
    >
      {muted ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}
