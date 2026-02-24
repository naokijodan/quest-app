'use server';

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, type OnboardingInput } from '@/features/quest/types/schema';

type ActionResult = { success?: true; error?: string };

export async function completeOnboarding(input: OnboardingInput): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: '認証が必要です。ログインし直してください。' };
    }

    // Validate using Zod (server-side source of truth)
    const parsed = onboardingSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { error: first?.message || '入力内容を確認してください。' };
    }

    const { username, avatar_type, mascot_type } = parsed.data;

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        username,
        avatar_type,
        mascot_type,
        onboarding_completed: true,
      });

    if (insertError) {
      // Unique violation handling (username duplication or pre-existing row)
      const code = (insertError as any).code as string | undefined;
      const message = insertError.message || '';
      const details = (insertError as any).details as string | undefined;

      const isUsernameDuplicate =
        code === '23505' && (message.includes('username') || details?.includes('username'));
      if (isUsernameDuplicate) {
        return { error: 'このユーザー名は既に使用されています。別の名前をお試しください。' };
      }

      // Generic conflict (e.g., row for id already exists)
      if (code === '23505') {
        return { error: 'すでにオンボーディングが完了しています。' };
      }

      return { error: '登録中にエラーが発生しました。時間をおいて再試行してください。' };
    }

    return { success: true };
  } catch {
    return { error: 'サーバーエラーが発生しました。' };
  }
}

