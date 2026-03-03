'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

export function ThemeProvider({ initialTheme }: { initialTheme?: string }) {
  const userTheme = useUserStore((s) => s.user?.ui_theme);

  useEffect(() => {
    const stored = (() => {
      try { return localStorage.getItem('quest-app-theme'); } catch { return null; }
    })();
    const theme = userTheme ?? stored ?? initialTheme ?? 'classic';
    document.documentElement.setAttribute('data-theme', theme);
  }, [userTheme, initialTheme]);

  return null;
}

