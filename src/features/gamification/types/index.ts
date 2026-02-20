export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 50,
  3: 200,
} as const;

export const DIFFICULTY_XP = {
  1: 10,
  2: 20,
  3: 40,
} as const;

export const LEVEL_UNLOCKS: Record<number, readonly string[]> = {
  1: ['basic'],
  2: ['basic', 'business', 'life'],
  3: ['basic', 'business', 'life', 'creative', 'analysis'],
} as const;

export function calculateLevel(xp: number): number {
  if (xp >= LEVEL_THRESHOLDS[3]) return 3;
  if (xp >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

export function xpToNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = calculateLevel(xp);
  if (level >= 3) {
    return { current: xp, next: LEVEL_THRESHOLDS[3], progress: 1 };
  }
  const currentThreshold = LEVEL_THRESHOLDS[level as keyof typeof LEVEL_THRESHOLDS];
  const nextThreshold = LEVEL_THRESHOLDS[(level + 1) as keyof typeof LEVEL_THRESHOLDS];
  const progress = (xp - currentThreshold) / (nextThreshold - currentThreshold);
  return { current: xp, next: nextThreshold, progress };
}

export function getUnlockedCategories(level: number): readonly string[] {
  return LEVEL_UNLOCKS[level] ?? LEVEL_UNLOCKS[1];
}
