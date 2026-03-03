import { create } from 'zustand';
import type { User, UITheme } from '@/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateXP: (xpGained: number, newLevel: number) => void;
  incrementQuestCount: () => void;
  setTheme: (theme: UITheme) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  updateXP: (xpGained, newLevel) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          experience_points: state.user.experience_points + xpGained,
          level: newLevel,
        },
      };
    }),
  incrementQuestCount: () =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          quest_count: state.user.quest_count + 1,
        },
      };
    }),
  setTheme: (theme) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: { ...state.user, ui_theme: theme },
      };
    }),
}));
