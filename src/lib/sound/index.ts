import { Howl } from 'howler';

type SoundName = 'cursor' | 'confirm' | 'cancel' | 'levelUp' | 'questComplete' | 'xpGain';

const SOUND_CONFIG: Record<SoundName, { src: string; volume: number }> = {
  cursor: { src: '/sounds/cursor.mp3', volume: 0.3 },
  confirm: { src: '/sounds/confirm.mp3', volume: 0.4 },
  cancel: { src: '/sounds/cancel.mp3', volume: 0.3 },
  levelUp: { src: '/sounds/level-up.mp3', volume: 0.6 },
  questComplete: { src: '/sounds/quest-complete.mp3', volume: 0.5 },
  xpGain: { src: '/sounds/xp-gain.mp3', volume: 0.4 },
};

let sounds: Partial<Record<SoundName, Howl>> = {};
let muted = false;
let initialized = false;

function initSounds(): void {
  if (initialized) return;
  initialized = true;

  for (const [name, config] of Object.entries(SOUND_CONFIG)) {
    sounds[name as SoundName] = new Howl({
      src: [config.src],
      volume: config.volume,
      preload: true,
      onloaderror: () => {
        // Sound file not found - silent fallback
        console.debug(`[Sound] ${name} not found, skipping`);
      },
    });
  }
}

export function playSound(name: SoundName): void {
  if (muted) return;
  if (typeof window === 'undefined') return;

  if (!initialized) {
    initSounds();
  }

  const sound = sounds[name];
  if (sound) {
    try {
      sound.play();
    } catch {
      // Silent fallback if audio context not ready
    }
  }
}

export function toggleMute(): boolean {
  muted = !muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('quest-app-muted', String(muted));
  }
  return muted;
}

export function isMuted(): boolean {
  if (typeof window !== 'undefined' && !initialized) {
    const stored = localStorage.getItem('quest-app-muted');
    if (stored !== null) {
      muted = stored === 'true';
    }
  }
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem('quest-app-muted', String(muted));
  }
}

// Initialize on first user interaction (required by browsers)
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  if (!initialized) {
    initSounds();
  }
}
