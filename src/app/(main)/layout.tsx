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
import { ScreenTransition } from '@/components/ui/ScreenTransition';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { UserStoreInitializer } from '@/components/ui/UserStoreInitializer';

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
      <UserStoreInitializer user={user} />
      {/* RPG HUD Header */}
      <header className="sticky top-0 z-40">
        <div className="rpg-window !rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2 sm:px-5">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-dot-gothic text-base sm:text-lg font-bold text-rpg-gold tracking-widest hover:text-white transition-colors">
                Quest App
              </Link>
              <div className="hidden sm:flex items-center gap-1">
                <NavLink href="/history" icon={<Scroll className="h-4 w-4" />} label="記録" />
                <NavLink href="/adventure" icon={<Sword className="h-4 w-4" />} label="冒険" />
                <NavLink href="/setup" icon={<Wrench className="h-4 w-4" />} label="装備" />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <StatusBar
                initialXp={user.experience_points}
                initialLevel={level}
                username={user.username}
              />
              <SoundToggle />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>
      <OfflineBanner />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <ScreenTransition>
          {children}
        </ScreenTransition>
      </main>
      <GameNav />
      <XpGainOverlay />
    </div>
  );
}
