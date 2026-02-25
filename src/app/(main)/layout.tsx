import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile } from '@/features/quest/actions';
import { calculateLevel } from '@/features/gamification/types';
import { XpProgressBar } from '@/components/ui/XpProgressBar';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { History, Settings, Sword } from 'lucide-react';
import { NavLink } from '@/components/ui/NavLink';
import { XpGainOverlay } from '@/features/gamification/components/XpGainOverlay';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

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
            <NavLink href="/history" icon={<History className="h-4 w-4" />} label="履歴" />
            <NavLink href="/adventure" icon={<Sword className="h-4 w-4" />} label="冒険" />
            <NavLink href="/setup" icon={<Settings className="h-4 w-4" />} label="セットアップ" />
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
      <OfflineBanner />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
      <XpGainOverlay />
    </div>
  );
}
