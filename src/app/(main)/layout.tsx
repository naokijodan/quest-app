import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile } from '@/features/quest/actions';
import { calculateLevel } from '@/features/gamification/types';
import { XpProgressBar } from '@/components/ui/XpProgressBar';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { History, Settings } from 'lucide-react';
import { XpGainOverlay } from '@/features/gamification/components/XpGainOverlay';

export const dynamic = 'force-dynamic';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserProfile();
  if (!user) {
    redirect('/login');
  }
  if (!user.onboarding_completed) {
    redirect('/onboarding');
  }

  const level = typeof user.level === 'number' ? user.level : calculateLevel(user.experience_points);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-card-border bg-card-bg/60 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <nav className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <span className="text-lg font-bold text-quest-primary">Quest App</span>
            </Link>
            <Link href="/history" className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">履歴</span>
            </Link>
            <Link href="/setup" className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">セットアップ</span>
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <XpProgressBar xp={user.experience_points} level={level} />
            <span className="text-muted">{user.username}</span>
            <span className="rounded-md border border-card-border bg-card-bg px-2 py-1 text-foreground">
              Lv.{level}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
      <XpGainOverlay />
    </div>
  );
}
