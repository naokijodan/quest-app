// Global type definitions

export type AvatarType = 'planner' | 'explorer' | 'crafter';
export type MascotType = 'cat' | 'dog';
export type QuestCategory = 'basic' | 'business' | 'life' | 'creative' | 'analysis' | 'adventure';
export type QuestDifficulty = 1 | 2 | 3;
export type QuestRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type QuestType = 'normal' | 'adventure';
export type OutputType = 'markdown' | 'json' | 'text' | 'csv';

export interface User {
  id: string;
  username: string;
  avatar_type: AvatarType;
  mascot_type: MascotType;
  experience_points: number;
  level: number;
  unlocked_categories: QuestCategory[];
  quest_count: number;
  onboarding_completed: boolean;
  adventure_chapter: number;
  created_at: string;
  updated_at: string;
}

export interface PresetQuest {
  id: string;
  quest_identifier: string;
  title: string;
  title_en: string | null;
  description: string;
  description_en: string | null;
  difficulty: QuestDifficulty;
  category: QuestCategory;
  xp_reward: number;
  prompt_template: string;
  // CLI execution fields (Phase 2)
  cli_tool: 'claude' | 'codex' | 'gemini';
  cli_prompt_template: string | null;
  allowed_commands: string[];
  working_directory: 'sandbox' | 'user_specified';
  requires_approval: boolean;
  max_execution_time: number;
  output_type: OutputType;
  required_inputs: QuestInput[];
  max_tokens_limit: number;
  icon: string;
  is_active: boolean;
  version: number;
  sort_order: number;
  // Adventure fields (Phase 3)
  quest_type: QuestType;
  adventure_chapter: number | null;
  adventure_order: number | null;
  story_intro: string | null;
  story_complete: string | null;
  terminal_command: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  description: string;
  example: string;
  options?: string[];
  validation: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
  };
}

export interface QuestRun {
  id: string;
  user_id: string;
  preset_quest_id: string | null;
  status: QuestRunStatus;
  input_data: Record<string, string>;
  partial_output: string | null;
  output_data: string | null;
  output_type: OutputType;
  actual_tokens_used: number | null;
  error_message: string | null;
  retry_count: number;
  started_at: string;
  completed_at: string | null;
}

export interface UserDailyQuota {
  id: string;
  user_id: string;
  quota_date: string;
  api_calls_made: number;
  tokens_used: number;
  last_reset_at: string;
}

export type AdventureQuestStatus = 'locked' | 'available' | 'completed';

export interface AdventureProgress {
  id: string;
  user_id: string;
  chapter: number;
  quest_identifier: string;
  status: AdventureQuestStatus;
  completed_at: string | null;
}

// SSE Event types for quest execution
export type QuestSSEEvent =
  | { type: 'start'; quest_run_id: string }
  | { type: 'delta'; content: string }
  | { type: 'progress'; message: string }
  | { type: 'complete'; quest_run_id: string; xp_gained: number; level_up: boolean }
  | { type: 'error'; message: string; retryable: boolean };
