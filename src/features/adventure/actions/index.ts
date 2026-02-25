'use server';

import { createClient } from '@/lib/supabase/server';
import type { PresetQuest, AdventureProgress } from '@/types';
import type { AdventureQuestWithProgress } from '@/features/adventure/types';

export async function getAdventureQuests(chapter: number): Promise<AdventureQuestWithProgress[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  const { data: quests } = await supabase
    .from('preset_quests')
    .select('*')
    .eq('quest_type', 'adventure')
    .eq('adventure_chapter', chapter)
    .order('adventure_order', { ascending: true });

  const questList = (quests as PresetQuest[]) ?? [];

  if (!user || questList.length === 0) {
    return questList.map((q) => ({ ...q, progress: null }));
  }

  const identifiers = questList.map((q) => q.quest_identifier);
  const { data: progress } = await supabase
    .from('adventure_progress')
    .select('*')
    .eq('user_id', user.id)
    .in('quest_identifier', identifiers);

  const progressMap = new Map<string, AdventureProgress>(
    ((progress as AdventureProgress[]) ?? []).map((p) => [p.quest_identifier, p])
  );

  return questList.map((q) => ({ ...q, progress: progressMap.get(q.quest_identifier) ?? null }));
}

export async function getAdventureProgress(): Promise<AdventureProgress[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];

  const { data } = await supabase
    .from('adventure_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('chapter', { ascending: true });

  return (data as AdventureProgress[]) ?? [];
}

export async function startAdventureChapter(chapter: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { success: false, error: '認証エラー' };

  const { data: quests } = await supabase
    .from('preset_quests')
    .select('quest_identifier, adventure_order')
    .eq('quest_type', 'adventure')
    .eq('adventure_chapter', chapter)
    .order('adventure_order', { ascending: true });

  const questRows = (quests as { quest_identifier: string; adventure_order: number }[]) ?? [];
  if (questRows.length === 0) return { success: true };

  const inserts = questRows.map((q) => ({
    user_id: user.id,
    chapter,
    quest_identifier: q.quest_identifier,
    status: q.adventure_order === 1 ? 'available' : 'locked',
    completed_at: null as string | null,
  }));

  // Upsert to avoid duplicates if already initialized
  const { error: upsertError } = await supabase
    .from('adventure_progress')
    .upsert(inserts, { onConflict: 'user_id,quest_identifier' });

  if (upsertError) return { success: false, error: '進行状況の初期化に失敗しました' };

  // Update user's current adventure chapter if lower
  await supabase
    .from('users')
    .update({ adventure_chapter: chapter })
    .eq('id', user.id)
    .lte('adventure_chapter', chapter);

  return { success: true };
}

export async function completeAdventureQuest(questIdentifier: string): Promise<{ success: boolean; error?: string; nextQuestIdentifier: string | null }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { success: false, error: '認証エラー', nextQuestIdentifier: null };

  // Find quest meta to locate chapter and order
  const { data: quest } = await supabase
    .from('preset_quests')
    .select('adventure_chapter, adventure_order')
    .eq('quest_identifier', questIdentifier)
    .eq('quest_type', 'adventure')
    .maybeSingle();

  if (!quest || !quest.adventure_chapter || !quest.adventure_order) {
    return { success: false, error: 'クエストが見つかりません', nextQuestIdentifier: null };
  }

  const chapter = quest.adventure_chapter as number;
  const order = quest.adventure_order as number;

  // Mark this quest as completed
  const { error: updateError } = await supabase
    .from('adventure_progress')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('quest_identifier', questIdentifier);

  if (updateError) return { success: false, error: '進行状況の更新に失敗しました', nextQuestIdentifier: null };

  // Unlock next quest if exists
  const { data: next } = await supabase
    .from('preset_quests')
    .select('quest_identifier')
    .eq('quest_type', 'adventure')
    .eq('adventure_chapter', chapter)
    .eq('adventure_order', order + 1)
    .maybeSingle();

  if (!next) {
    return { success: true, nextQuestIdentifier: null };
  }

  await supabase
    .from('adventure_progress')
    .update({ status: 'available' })
    .eq('user_id', user.id)
    .eq('quest_identifier', next.quest_identifier as string);

  return { success: true, nextQuestIdentifier: (next.quest_identifier as string) ?? null };
}

