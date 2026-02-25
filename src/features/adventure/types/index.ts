import type { PresetQuest, AdventureProgress } from '@/types';

export interface Chapter {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  requiredLevel: number;
  icon: string;
}

export const CHAPTERS: readonly Chapter[] = [
  { number: 1, title: '旅立ちの村', subtitle: 'Lv.1-2', description: 'AIが全部やってくれる。まずはお願いするだけ。', requiredLevel: 1, icon: '🏠' },
  { number: 2, title: '森の試練', subtitle: 'Lv.3-4', description: '簡単なコマンドを1つずつ実行してみよう。', requiredLevel: 4, icon: '🌲' },
  { number: 3, title: '山岳の修行', subtitle: 'Lv.5-6', description: 'ファイル操作とGitの基本を学ぶ。', requiredLevel: 6, icon: '⛰️' },
  { number: 4, title: '魔王城への道', subtitle: 'Lv.7-8', description: 'パッケージ管理とスクリプト実行。', requiredLevel: 7, icon: '🏰' },
  { number: 5, title: '魔王戦', subtitle: 'Lv.9-10', description: 'ターミナルとの最終対決。', requiredLevel: 9, icon: '👑' },
] as const;

export interface AdventureQuestWithProgress extends PresetQuest {
  progress: AdventureProgress | null;
}

