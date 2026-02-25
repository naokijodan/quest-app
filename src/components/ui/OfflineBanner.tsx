'use client';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 bg-quest-accent/20 px-4 py-2 text-sm text-quest-accent">
      <WifiOff className="h-4 w-4" />
      <span>オフライン状態です。一部の機能が制限されます。</span>
    </div>
  );
}

