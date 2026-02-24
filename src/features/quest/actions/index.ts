'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  PresetQuest,
  QuestRun,
  User,
  QuestCategory,
  QuestDifficulty,
} from '@/types';

export async function getPresetQuests(): Promise<PresetQuest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('preset_quests')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  return (data as PresetQuest[]) ?? [];
}

export async function getPresetQuestById(id: string): Promise<PresetQuest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('preset_quests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as PresetQuest) ?? null;
}

export async function getQuestRun(id: string): Promise<QuestRun | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('quest_runs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as QuestRun) ?? null;
}

export async function getUserProfile(): Promise<User | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  return (data as User) ?? null;
}

export async function getRecentQuestRuns(limit = 10): Promise<QuestRun[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];
  const { data } = await supabase
    .from('quest_runs')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit);
  return (data as QuestRun[]) ?? [];
}

export interface QuestRunWithQuest extends QuestRun {
  quest_title: string;
  quest_icon: string;
  quest_category: QuestCategory;
  quest_difficulty: QuestDifficulty;
  xp_reward: number;
}

export async function getQuestRunsWithQuestInfo(limit = 20): Promise<QuestRunWithQuest[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];

  const { data: runs } = await supabase
    .from('quest_runs')
    .select('*, preset_quests(title, icon, category, difficulty, xp_reward)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (!runs) return [];

  return runs.map((run: any) => ({
    ...run,
    quest_title: run.preset_quests?.title ?? '不明なクエスト',
    quest_icon: run.preset_quests?.icon ?? '📝',
    quest_category: run.preset_quests?.category ?? 'basic',
    quest_difficulty: run.preset_quests?.difficulty ?? 1,
    xp_reward: run.preset_quests?.xp_reward ?? 0,
    preset_quests: undefined,
  })) as QuestRunWithQuest[];
}

export async function getDailyQuota(): Promise<{ used: number; limit: number }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { used: 0, limit: 10 };

  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('user_daily_quotas')
    .select('api_calls_made')
    .eq('user_id', user.id)
    .eq('quota_date', today)
    .maybeSingle();

  return {
    used: data?.api_calls_made ?? 0,
    limit: 10,
  };
}
