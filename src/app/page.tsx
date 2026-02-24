import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles, Zap, Shield, Trophy, Lock, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { CATEGORY_LABELS } from '@/features/quest/constants/category';
import { XpProgressBar } from '@/components/ui/XpProgressBar';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { createClient } from '@/lib/supabase/server';
import { getPresetQuests, getUserProfile } from '@/features/quest/actions';
import { getDailyQuota } from '@/features/quest/actions';
import { DailyQuota } from '@/features/gamification/components/DailyQuota';
import { calculateLevel, getUnlockedCategories } from '@/features/gamification/types';
import { QuestCard } from '@/features/quest/components/QuestCard';
import type { QuestCategory } from '@/types';

const CATEGORY_ORDER: QuestCategory[] = ['basic', 'business', 'life', 'creative', 'analysis'];

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingContent />;
  }

  const profile = await getUserProfile();
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  const quests = await getPresetQuests();
  const quota = await getDailyQuota();
  const level = typeof profile.level === 'number' ? profile.level : calculateLevel(profile.experience_points);
  const unlocked = profile.unlocked_categories?.length
    ? (profile.unlocked_categories as readonly string[])
    : getUnlockedCategories(level);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    quests: quests.filter((q) => q.category === cat),
  }));

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
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <XpProgressBar xp={profile.experience_points} level={level} />
            <span className="text-muted">{profile.username}</span>
            <span className="rounded-md border border-card-border bg-card-bg px-2 py-1 text-foreground">
              Lv.{level}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-foreground">クエストを選ぼう！</h1>
              <p className="text-sm text-muted">レベルに応じて新しいカテゴリが解放されます。</p>
            </div>
            <DailyQuota used={quota.used} limit={quota.limit} />
          </div>

          <div className="space-y-6">
            {grouped.map(({ category, quests }) => {
              const isLocked = !unlocked.includes(category);
              return (
                <section key={category} aria-label={`category-${category}`}>
                  <Card padding="lg" className={isLocked ? 'opacity-70' : ''}>
                    <CardHeader className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>{CATEGORY_LABELS[category]}</CardTitle>
                        {isLocked && (
                          <span className="flex items-center gap-1 rounded-md border border-card-border bg-muted-bg px-2 py-1 text-xs text-muted">
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        {isLocked ? 'レベルアップして解放しよう' : '挑戦するクエストを選択'}
                      </CardDescription>
                    </CardHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {quests.length === 0 && (
                        <p className="text-sm text-muted">クエストがありません。</p>
                      )}
                      {quests.map((q) => (
                        <QuestCard key={q.id} quest={q} locked={isLocked} />
                      ))}
                    </div>
                  </Card>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function LandingContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <main className="w-full max-w-2xl text-center">
        <div className="mb-8 flex items-center justify-center gap-3 text-quest-primary">
          <Sparkles className="h-10 w-10" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Quest App
          </h1>
        </div>

        <p className="mx-auto mb-12 max-w-md text-lg text-muted">
          クエストを選んで、30秒でAIの成果物を手に入れよう。
          <br />
          誰でも使える、ゲーム風AIワークフロー。
        </p>

        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-quest-accent" />}
            title="30秒で完成"
            description="選ぶ → 入力 → 完成。難しい設定は一切不要"
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6 text-quest-primary" />}
            title="レベルアップ"
            description="クエストをこなしてXPを獲得。新しいクエストが解放される"
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-quest-success" />}
            title="安心設計"
            description="データは安全に保護。お子様から高齢者まで安心"
          />
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/register">
            <Button size="lg" className="min-w-[180px]">
              冒険を始める
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="min-w-[180px]">
              ログイン
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5 text-left">
      <div className="mb-3">{icon}</div>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
