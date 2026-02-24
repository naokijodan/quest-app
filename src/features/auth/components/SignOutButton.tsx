'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/features/auth/actions';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-muted hover:text-quest-danger"
        aria-label="サインアウト"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </form>
  );
}

