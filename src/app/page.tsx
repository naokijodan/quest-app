import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles, Zap, Shield, Trophy, Lock, ArrowRight, Sword, Scroll } from 'lucide-react';
import { NavLink } from '@/components/ui/NavLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/features/quest/constants/category';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { StatusBar } from '@/components/ui/StatusBar';
import { GameNav } from '@/components/ui/GameNav';
import { createClient } from '@/lib/supabase/server';
import { getPresetQuests, getUserProfile } from '@/features/quest/actions';
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
  const level = typeof profile.level === 'number' ? profile.level : calculateLevel(profile.experience_points);
  const unlocked = profile.unlocked_categories?.length
    ? (profile.unlocked_categories as readonly string[])
    : getUnlockedCategories(level);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    quests: quests.filter((q) => q.category === cat),
  }));

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      {/* Header */}
      <header className="border-b border-card-border bg-card-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <nav className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <span className="text-lg font-bold text-quest-primary tracking-wide">Quest App</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <NavLink href="/history" icon={<Scroll className="h-4 w-4" />} label="冒険の記録" />
              <NavLink href="/adventure" icon={<Sword className="h-4 w-4" />} label="冒険に出る" />
            </div>
          </nav>
          <div className="flex items-center gap-3">
            <StatusBar
              initialXp={profile.experience_points}
              initialLevel={level}
              username={profile.username}
            />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          {/* Guild Board Header */}
          <div className="guild-board-header rounded-t-lg px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl">ギルド掲示板</h1>
                  <p className="text-sm text-muted">依頼を選んで報酬を手に入れよう</p>
                </div>
              </div>
            </div>
          </div>

          {/* Adventure Route CTA */}
          <Link href="/adventure">
            <div className="group relative overflow-hidden rounded-xl border border-quest-primary/30 bg-gradient-to-r from-quest-primary/10 via-card-bg to-quest-primary/5 p-5 transition-all duration-300 hover:border-quest-primary/60 hover:shadow-lg hover:shadow-quest-primary/10 rpg-border-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-quest-primary/20 text-2xl torch-flicker">
                    ⚔️
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">冒険に出る</h2>
                    <p className="text-sm text-muted">ターミナルの魔王を倒す旅に出よう</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-quest-primary transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Quest Categories - Guild Board */}
          <div className="space-y-5">
            {grouped.map(({ category, quests: catQuests }) => {
              const isLocked = !unlocked.includes(category);
              const icon = CATEGORY_ICONS[category];
              return (
                <section key={category} aria-label={`category-${category}`}>
                  <div className={`guild-board rounded-xl p-5 sm:p-6 ${isLocked ? 'opacity-70' : ''}`}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <h2 className="text-base font-bold text-foreground sm:text-lg">{CATEGORY_LABELS[category]}</h2>
                        {isLocked && (
                          <span className="flex items-center gap-1 rounded-md border border-card-border bg-background px-2 py-0.5 text-xs text-muted">
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">
                        {isLocked ? 'レベルアップして解放' : `${catQuests.length} 件の依頼`}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 stagger-children">
                      {catQuests.length === 0 && (
                        <p className="text-sm text-muted">依頼がありません。</p>
                      )}
                      {catQuests.map((q) => (
                        <QuestCard key={q.id} quest={q} locked={isLocked} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <GameNav />
    </div>
  );
}

function LandingContent() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Subtle background particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-quest-primary/20"
            style={{
              width: `${4 + i * 2}px`,
              height: `${4 + i * 2}px`,
              left: `${15 + i * 14}%`,
              top: `${20 + i * 10}%`,
              animation: `particle-float ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <main className="relative w-full max-w-2xl text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="text-4xl">⚔️</span>
          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a78bfa, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Quest App
          </h1>
        </div>

        <p className="mx-auto mb-4 max-w-md text-xl font-semibold text-foreground">
          ターミナルの魔王を倒す冒険に出よう
        </p>
        <p className="mx-auto mb-12 max-w-md text-base text-muted">
          クエストを選んで、30秒でAIの成果物を手に入れる。
          <br />
          誰でも使える、RPG風AIワークフロー。
        </p>

        <div className="mb-12 grid gap-5 sm:grid-cols-3 stagger-children">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-quest-accent" />}
            title="30秒で完成"
            description="依頼を受注 → 入力 → 完成。難しい設定は一切不要"
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6 text-quest-primary" />}
            title="レベルアップ"
            description="依頼をこなしてXPを獲得。新しいクエストが解放される"
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-quest-success" />}
            title="安心設計"
            description="データは安全に保護。お子様から高齢者まで安心"
          />
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/register">
            <Button size="lg" className="min-w-[200px] glow-primary">
              冒険を始める
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="min-w-[200px]">
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
    <div className="rounded-xl border border-card-border parchment-card p-5 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-quest-primary/30">
      <div className="mb-3">{icon}</div>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
