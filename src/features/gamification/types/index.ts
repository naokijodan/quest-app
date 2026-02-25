export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 50,
  3: 200,
  4: 500,
  5: 1000,
  6: 2000,
  7: 3500,
  8: 5500,
  9: 8000,
  10: 12000,
} as const;

export const DIFFICULTY_XP: Record<number, number> = {
  1: 10,
  2: 20,
  3: 40,
} as const;

export const LEVEL_UNLOCKS: Record<number, readonly string[]> = {
  1: ['basic'],
  2: ['basic', 'business', 'life'],
  3: ['basic', 'business', 'life', 'creative', 'analysis'],
  4: ['basic', 'business', 'life', 'creative', 'analysis'],
  5: ['basic', 'business', 'life', 'creative', 'analysis'],
  6: ['basic', 'business', 'life', 'creative', 'analysis'],
  7: ['basic', 'business', 'life', 'creative', 'analysis'],
  8: ['basic', 'business', 'life', 'creative', 'analysis'],
  9: ['basic', 'business', 'life', 'creative', 'analysis'],
  10: ['basic', 'business', 'life', 'creative', 'analysis'],
} as const;

export const MAX_LEVEL = 10;

export function calculateLevel(xp: number): number {
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (xp >= LEVEL_THRESHOLDS[level]) return level;
  }
  return 1;
}

export function xpToNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = calculateLevel(xp);
  if (level >= MAX_LEVEL) {
    return { current: xp, next: LEVEL_THRESHOLDS[MAX_LEVEL], progress: 1 };
  }
  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextThreshold = LEVEL_THRESHOLDS[level + 1];
  const progress = (xp - currentThreshold) / (nextThreshold - currentThreshold);
  return { current: xp, next: nextThreshold, progress };
}

export function getUnlockedCategories(level: number): readonly string[] {
  return LEVEL_UNLOCKS[level] ?? LEVEL_UNLOCKS[1];
}
