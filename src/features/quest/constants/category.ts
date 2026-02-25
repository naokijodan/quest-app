import type { QuestCategory } from '@/types';

export const CATEGORY_LABELS: Record<QuestCategory, string> = {
  basic: '基本の依頼',
  business: 'ビジネス依頼',
  life: '生活の依頼',
  creative: '創作の依頼',
  analysis: '調査の依頼',
  adventure: '冒険',
} as const;

export const CATEGORY_ICONS: Record<QuestCategory, string> = {
  basic: '📜',
  business: '💼',
  life: '🏡',
  creative: '🎨',
  analysis: '🔍',
  adventure: '⚔️',
} as const;
