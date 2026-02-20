'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/uiStore';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
} as const;

const styles = {
  success: 'border-quest-success/30 bg-quest-success/10 text-quest-success',
  error: 'border-quest-danger/30 bg-quest-danger/10 text-quest-danger',
  info: 'border-quest-info/30 bg-quest-info/10 text-quest-info',
} as const;

export function Toast() {
  const { toastMessage, toastType, hideToast } = useUIStore();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;

    setExiting(false);
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(hideToast, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toastMessage, hideToast]);

  if (!toastMessage) return null;

  const Icon = icons[toastType];

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
          styles[toastType],
          exiting ? 'toast-exit' : 'toast-enter'
        )}
        role="alert"
      >
        <Icon className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{toastMessage}</p>
        <button
          onClick={() => {
            setExiting(true);
            setTimeout(hideToast, 300);
          }}
          className="ml-2 shrink-0 rounded p-0.5 transition-opacity hover:opacity-70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
