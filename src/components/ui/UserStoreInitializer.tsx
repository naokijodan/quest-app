'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types';

export function UserStoreInitializer({ user }: { user: User }) {
  const storeUser = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (!storeUser) {
      setUser(user);
    }
  }, [storeUser, setUser, user]);

  return null;
}
