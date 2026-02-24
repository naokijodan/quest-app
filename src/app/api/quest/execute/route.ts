import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { questExecuteSchema } from '@/features/quest/types/schema';
import { renderTemplate } from '@/lib/anthropic/templates';
import { startTextStream } from '@/lib/anthropic/stream';
import { DIFFICULTY_XP, calculateLevel, getUnlockedCategories } from '@/features/gamification/types';
import type { QuestSSEEvent } from '@/types';

export const dynamic = 'force-dynamic';

function sseChunk(event: QuestSSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function todayDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export async function POST(req: Request): Promise<Response> {
  const encoder = new TextEncoder();
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = questExecuteSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { questId, inputs } = parsed.data;

  // Fetch user profile (level/xp/mascot)
  const { data: profileRow, error: profileError } = await supabase
    .from('users')
    .select('id, experience_points, level, mascot_type, unlocked_categories')
    .eq('id', user.id)
    .single();
  if (profileError || !profileRow) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
  }

  // Fetch quest
  const { data: quest, error: questError } = await supabase
    .from('preset_quests')
    .select('*')
    .eq('id', questId)
    .eq('is_active', true)
    .single();
  if (questError || !quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
  }

  // Category access check based on level
  const currentLevel = typeof profileRow.level === 'number' ? profileRow.level : calculateLevel(profileRow.experience_points ?? 0);
  const allowedCategories = getUnlockedCategories(currentLevel);
  if (!allowedCategories.includes(quest.category)) {
    return NextResponse.json({ error: 'Category is locked for your level' }, { status: 403 });
  }

  // Daily quota check (Free plan)
  const quotaDate = todayDate();
  const { data: quotaRow } = await supabase
    .from('user_daily_quotas')
    .select('*')
    .eq('user_id', user.id)
    .eq('quota_date', quotaDate)
    .maybeSingle();

  const callsMade = quotaRow?.api_calls_made ?? 0;
  const tokensUsed = quotaRow?.tokens_used ?? 0;
  const MAX_CALLS = 10;
  const MAX_TOKENS = 10000;
  if (callsMade >= MAX_CALLS || tokensUsed >= MAX_TOKENS) {
    return NextResponse.json({ error: 'Daily quota exceeded' }, { status: 429 });
  }

  // Ensure quota row exists for today
  if (!quotaRow) {
    await supabase.from('user_daily_quotas').insert({ user_id: user.id, quota_date: quotaDate });
  }

  // Create quest_run (running)
  const nowIso = new Date().toISOString();
  const runInsert = {
    user_id: user.id,
    preset_quest_id: quest.id,
    status: 'running',
    input_data: inputs,
    partial_output: null,
    output_data: null,
    output_type: quest.output_type,
    retry_count: 0,
    started_at: nowIso,
  } as const;

  const { data: runRow, error: runError } = await supabase
    .from('quest_runs')
    .insert(runInsert)
    .select('*')
    .single();

  if (runError || !runRow) {
    return NextResponse.json({ error: 'Failed to create quest run' }, { status: 500 });
  }

  const mascot = (profileRow.mascot_type as 'cat' | 'dog') ?? 'cat';
  const progressMessages: string[] =
    mascot === 'dog'
      ? [
          'ワン！準備運動ばっちり、走り出すよ！',
          'クンクン…いい感じ！答えに近づいてるワン！',
          'もう少しでゴール！待っててね！',
        ]
      : [
          'にゃっ、準備完了。解析を始めるにゃ。',
          'ふむふむ…いい手応えだにゃ。',
          'ラストスパートにゃ。もうすぐ完成！',
        ];

  const readable = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      let partial = '';
      let sentProgress = 0;
      const send = (event: QuestSSEEvent) => controller.enqueue(encoder.encode(sseChunk(event)));

      try {
        send({ type: 'start', quest_run_id: runRow.id });

        const rendered = renderTemplate(quest.prompt_template, inputs);
        const handle = await startTextStream({ prompt: rendered, maxTokens: quest.max_tokens_limit });

        const abortHandler = () => {
          try { handle.cancel(); } catch {}
          controller.close();
        };
        req.signal.addEventListener('abort', abortHandler, { once: true });

        for await (const chunk of handle.stream) {
          partial += chunk;
          send({ type: 'delta', content: chunk });

          // opportunistic progress messages
          const thresholds = [200, 800, 1600];
          if (sentProgress < progressMessages.length && partial.length > thresholds[Math.min(sentProgress, thresholds.length - 1)]) {
            send({ type: 'progress', message: progressMessages[sentProgress] });
            sentProgress += 1;
          }
        }

        const usage = await handle.finalUsage();

        // Complete the run
        const newXP = (profileRow.experience_points ?? 0) + (DIFFICULTY_XP as any)[quest.difficulty as 1 | 2 | 3];
        const prevLevel = currentLevel;
        const newLevel = calculateLevel(newXP);
        const levelUp = newLevel > prevLevel;

        await supabase
          .from('quest_runs')
          .update({
            status: 'completed',
            output_data: partial,
            partial_output: null,
            actual_tokens_used: usage.totalTokens,
            completed_at: new Date().toISOString(),
          })
          .eq('id', runRow.id);

        await supabase
          .from('users')
          .update({
            experience_points: newXP,
            level: newLevel,
            unlocked_categories: getUnlockedCategories(newLevel) as any,
            quest_count: (profileRow as any).quest_count ? (profileRow as any).quest_count + 1 : 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        await supabase
          .from('user_daily_quotas')
          .upsert({
            user_id: user.id,
            quota_date: quotaDate,
            api_calls_made: callsMade + 1,
            tokens_used: tokensUsed + usage.totalTokens,
          }, { onConflict: 'user_id,quota_date' });

        send({ type: 'complete', quest_run_id: runRow.id, xp_gained: (DIFFICULTY_XP as any)[quest.difficulty as 1 | 2 | 3], level_up: levelUp });
        controller.close();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        try {
          await supabase
            .from('quest_runs')
            .update({ status: 'failed', partial_output: partial || null, error_message: message })
            .eq('id', runRow.id);
        } catch {}
        send({ type: 'error', message, retryable: true });
        controller.close();
      }
    },
    cancel: () => {
      // stream closed by client
    },
  });

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  return new Response(readable, { headers });
}
