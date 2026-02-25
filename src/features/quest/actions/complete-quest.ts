'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateLevel, DIFFICULTY_XP, getUnlockedCategories } from '@/features/gamification/types';

export interface CompleteQuestResult {
  success: boolean;
  quest_run_id: string | null;
  xp_gained: number;
  new_level: number;
  level_up: boolean;
  error: string | null;
}

export async function completeQuestRun(params: {
  preset_quest_id: string;
  input_data: Record<string, string>;
  output_data: string;
}): Promise<CompleteQuestResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return { success: false, quest_run_id: null, xp_gained: 0, new_level: 1, level_up: false, error: '認証エラー' };
  }

  // 1. Get quest info for XP calculation
  const { data: quest } = await supabase
    .from('preset_quests')
    .select('difficulty, xp_reward')
    .eq('id', params.preset_quest_id)
    .maybeSingle();

  if (!quest) {
    return { success: false, quest_run_id: null, xp_gained: 0, new_level: 1, level_up: false, error: 'クエストが見つかりません' };
  }

  // 2. Get current user profile
  const { data: profile } = await supabase
    .from('users')
    .select('experience_points, level, quest_count')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    return { success: false, quest_run_id: null, xp_gained: 0, new_level: 1, level_up: false, error: 'ユーザー情報が見つかりません' };
  }

  // 3. Calculate XP
  const xpGained = quest.xp_reward ?? (DIFFICULTY_XP[quest.difficulty as number] ?? 10);
  const newTotalXP = profile.experience_points + xpGained;
  const newLevel = calculateLevel(newTotalXP);
  const levelUp = newLevel > profile.level;
  const unlockedCategories = getUnlockedCategories(newLevel);

  // 4. Create quest_run record
  const { data: run, error: runError } = await supabase
    .from('quest_runs')
    .insert({
      user_id: user.id,
      preset_quest_id: params.preset_quest_id,
      status: 'completed',
      input_data: params.input_data,
      output_data: params.output_data,
      output_type: 'markdown',
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (runError) {
    return { success: false, quest_run_id: null, xp_gained: 0, new_level: profile.level, level_up: false, error: '履歴の保存に失敗しました' };
  }

  // 5. Update user XP, level, quest_count, unlocked_categories
  const { error: updateError } = await supabase
    .from('users')
    .update({
      experience_points: newTotalXP,
      level: newLevel,
      quest_count: profile.quest_count + 1,
      unlocked_categories: unlockedCategories,
    })
    .eq('id', user.id);

  if (updateError) {
    return { success: false, quest_run_id: run.id, xp_gained: 0, new_level: profile.level, level_up: false, error: 'ユーザー情報の更新に失敗しました' };
  }

  return {
    success: true,
    quest_run_id: run.id,
    xp_gained: xpGained,
    new_level: newLevel,
    level_up: levelUp,
    error: null,
  };
}
