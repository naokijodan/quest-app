import type { QuestCategory } from '@/types';

export const CATEGORY_LABELS: Record<QuestCategory, string> = {
  basic: '基本',
  business: 'ビジネス',
  life: '生活',
  creative: 'クリエイティブ',
  analysis: '分析',
  adventure: '冒険',
} as const;

