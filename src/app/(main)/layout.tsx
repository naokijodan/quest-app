import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile } from '@/features/quest/actions';
import { calculateLevel } from '@/features/gamification/types';

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
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <span className="text-lg font-bold text-quest-primary">Quest App</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">{user.username}</span>
            <span className="rounded-md border border-card-border bg-card-bg px-2 py-1 text-foreground">
              Lv.{level}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

