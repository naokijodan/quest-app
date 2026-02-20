import { create } from 'zustand';

interface UIState {
  showLevelUpModal: boolean;
  showXPGain: boolean;
  xpGainAmount: number;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  setLevelUpModal: (show: boolean) => void;
  showXPGainAnimation: (amount: number) => void;
  hideXPGain: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  showLevelUpModal: false,
  showXPGain: false,
  xpGainAmount: 0,
  toastMessage: null,
  toastType: 'info',
  setLevelUpModal: (showLevelUpModal) => set({ showLevelUpModal }),
  showXPGainAnimation: (amount) =>
    set({ showXPGain: true, xpGainAmount: amount }),
  hideXPGain: () => set({ showXPGain: false, xpGainAmount: 0 }),
  showToast: (message, type = 'info') =>
    set({ toastMessage: message, toastType: type }),
  hideToast: () => set({ toastMessage: null }),
}));
