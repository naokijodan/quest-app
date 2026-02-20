import { create } from 'zustand';
import type { QuestSSEEvent } from '@/types';

interface QuestExecutionState {
  isExecuting: boolean;
  currentQuestRunId: string | null;
  streamedContent: string;
  progressMessages: string[];
  error: string | null;
  startExecution: (questRunId: string) => void;
  appendContent: (content: string) => void;
  addProgressMessage: (message: string) => void;
  completeExecution: () => void;
  failExecution: (error: string) => void;
  reset: () => void;
}

export const useQuestStore = create<QuestExecutionState>((set) => ({
  isExecuting: false,
  currentQuestRunId: null,
  streamedContent: '',
  progressMessages: [],
  error: null,
  startExecution: (questRunId) =>
    set({
      isExecuting: true,
      currentQuestRunId: questRunId,
      streamedContent: '',
      progressMessages: [],
      error: null,
    }),
  appendContent: (content) =>
    set((state) => ({
      streamedContent: state.streamedContent + content,
    })),
  addProgressMessage: (message) =>
    set((state) => ({
      progressMessages: [...state.progressMessages, message],
    })),
  completeExecution: () =>
    set({ isExecuting: false }),
  failExecution: (error) =>
    set({ isExecuting: false, error }),
  reset: () =>
    set({
      isExecuting: false,
      currentQuestRunId: null,
      streamedContent: '',
      progressMessages: [],
      error: null,
    }),
}));
