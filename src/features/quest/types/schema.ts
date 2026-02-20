import { z } from 'zod';

export const questExecuteSchema = z.object({
  questId: z.string().uuid(),
  inputs: z.record(z.string(), z.string().max(5000)),
});

export const profileUpdateSchema = z.object({
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  avatar_type: z.enum(['planner', 'explorer', 'crafter']),
  mascot_type: z.enum(['cat', 'dog']),
});

export const onboardingSchema = z.object({
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  avatar_type: z.enum(['planner', 'explorer', 'crafter']),
  mascot_type: z.enum(['cat', 'dog']),
});

export type QuestExecuteInput = z.infer<typeof questExecuteSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
