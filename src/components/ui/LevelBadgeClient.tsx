'use client';

import { useUserStore } from '@/stores/userStore';

interface Props {
  initialLevel: number;
}

export function LevelBadgeClient({ initialLevel }: Props) {
  const storeUser = useUserStore((s) => s.user);
  const level = storeUser?.level ?? initialLevel;

  return (
    <span className="rounded-md border border-card-border bg-card-bg px-2 py-1 text-foreground">
      Lv.{level}
    </span>
  );
}
