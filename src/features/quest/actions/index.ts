'use server';

import { createClient } from '@/lib/supabase/server';
import type { PresetQuest, QuestRun, User } from '@/types';

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

