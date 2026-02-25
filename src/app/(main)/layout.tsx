import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile } from '@/features/quest/actions';
import { calculateLevel } from '@/features/gamification/types';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { Scroll, Sword, Wrench } from 'lucide-react';
import { NavLink } from '@/components/ui/NavLink';
import { XpGainOverlay } from '@/features/gamification/components/XpGainOverlay';
import { StatusBar } from '@/components/ui/StatusBar';
import { GameNav } from '@/components/ui/GameNav';
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
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <header className="border-b border-card-border bg-card-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <nav className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <span className="text-lg font-bold text-quest-primary tracking-wide">Quest App</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <NavLink href="/history" icon={<Scroll className="h-4 w-4" />} label="冒険の記録" />
              <NavLink href="/adventure" icon={<Sword className="h-4 w-4" />} label="冒険に出る" />
              <NavLink href="/setup" icon={<Wrench className="h-4 w-4" />} label="装備" />
            </div>
          </nav>
          <div className="flex items-center gap-3">
            <StatusBar
              initialXp={user.experience_points}
              initialLevel={level}
              username={user.username}
            />
            <SignOutButton />
          </div>
        </div>
      </header>
      <OfflineBanner />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
      <GameNav />
      <XpGainOverlay />
    </div>
  );
}
