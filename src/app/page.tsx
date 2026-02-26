import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles, Zap, Shield, Trophy, Lock, Sword, Scroll } from 'lucide-react';
import { NavLink } from '@/components/ui/NavLink';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/features/quest/constants/category';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { StatusBar } from '@/components/ui/StatusBar';
import { GameNav } from '@/components/ui/GameNav';
import { createClient } from '@/lib/supabase/server';
import { getPresetQuests, getUserProfile } from '@/features/quest/actions';
import { calculateLevel, getUnlockedCategories } from '@/features/gamification/types';
import { QuestCard } from '@/features/quest/components/QuestCard';
import { GuildBoardNPC } from '@/features/quest/components/GuildBoardNPC';
import { StaggerList, StaggerItem } from '@/components/ui/StaggerList';
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
    <div className="min-h-screen bg-background pb-16 sm:pb-0 relative">
      {/* Guild hall background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: 'url(/sprites/guild-hall-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />

      {/* RPG HUD Header */}
      <header className="sticky top-0 z-40 relative">
        <div className="rpg-window !rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2 sm:px-5">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-dot-gothic text-base sm:text-lg font-bold text-rpg-gold tracking-widest hover:text-white transition-colors">
                Quest App
              </Link>
              <div className="hidden sm:flex items-center gap-1">
                <NavLink href="/history" icon={<Scroll className="h-4 w-4" />} label="記録" />
                <NavLink href="/adventure" icon={<Sword className="h-4 w-4" />} label="冒険" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBar
                initialXp={profile.experience_points}
                initialLevel={level}
                username={profile.username}
              />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="space-y-5">
          {/* NPC Message */}
          <GuildBoardNPC username={profile.username} level={level} />

          {/* Adventure Route CTA */}
          <Link href="/adventure">
            <div className="rpg-window group !p-4 transition-all duration-300 hover:shadow-[inset_0_0_0_1px_var(--rpg-window-border-inner),0_0_0_3px_var(--rpg-window-bg-to),0_0_0_5px_var(--rpg-window-border),0_0_20px_rgba(99,102,241,0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl torch-flicker">&#x2694;&#xFE0F;</span>
                  <div className="font-dot-gothic">
                    <h2 className="text-base font-bold text-white">&#x25B6; &#x5192;&#x967A;&#x306B;&#x51FA;&#x308B;</h2>
                    <p className="text-xs text-blue-200/70">&#x30BF;&#x30FC;&#x30DF;&#x30CA;&#x30EB;&#x306E;&#x9B54;&#x738B;&#x3092;&#x5012;&#x3059;&#x65C5;&#x306B;&#x51FA;&#x3088;&#x3046;</p>
                  </div>
                </div>
                <span className="text-blue-200/40 group-hover:text-white transition-colors text-lg">&#x25B6;</span>
              </div>
            </div>
          </Link>

          {/* Quest Categories - Guild Board */}
          <div className="space-y-4">
            {grouped.map(({ category, quests: catQuests }) => {
              const isLocked = !unlocked.includes(category);
              const icon = CATEGORY_ICONS[category];
              return (
                <section key={category} aria-label={`category-${category}`}>
                  <div className={`rpg-window !p-4 sm:!p-5 ${isLocked ? 'opacity-60' : ''}`}>
                    <div className="mb-3 flex items-center justify-between font-dot-gothic">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <h2 className="text-sm font-bold text-white sm:text-base">{CATEGORY_LABELS[category]}</h2>
                        {isLocked && (
                          <span className="flex items-center gap-1 rounded border border-blue-200/20 bg-blue-900/30 px-2 py-0.5 text-[10px] text-blue-200/60">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-blue-200/50">
                        {isLocked ? 'Lvアップで解放' : `${catQuests.length} 件`}
                      </span>
                    </div>

                    <StaggerList className="grid gap-2 sm:grid-cols-2">
                      {catQuests.length === 0 && (
                        <p className="text-xs text-blue-200/40 font-dot-gothic">依頼なし</p>
                      )}
                      {catQuests.map((q) => (
                        <StaggerItem key={q.id}>
                          <QuestCard quest={q} locked={isLocked} />
                        </StaggerItem>
                      ))}
                    </StaggerList>
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
      {/* Background particles */}
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
        <div className="mb-8">
          <span className="text-5xl block mb-4">&#x2694;&#xFE0F;</span>
          <h1 className="font-dot-gothic text-4xl font-bold tracking-wider sm:text-5xl text-rpg-gold">
            Quest App
          </h1>
          <div className="mt-1 h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-rpg-gold/60 to-transparent" />
        </div>

        {/* RPG Message Window */}
        <div className="rpg-window !p-5 mb-8 text-left">
          <p className="font-dot-gothic text-sm sm:text-base text-blue-100 leading-relaxed">
            &#x30BF;&#x30FC;&#x30DF;&#x30CA;&#x30EB;&#x306E;&#x9B54;&#x738B;&#x3092;&#x5012;&#x3059;&#x5192;&#x967A;&#x306B;&#x51FA;&#x3088;&#x3046;&#x3002;<br/>
            &#x30AF;&#x30A8;&#x30B9;&#x30C8;&#x3092;&#x9078;&#x3093;&#x3067;&#x3001;30&#x79D2;&#x3067;AI&#x306E;&#x6210;&#x679C;&#x7269;&#x3092;&#x624B;&#x306B;&#x5165;&#x308C;&#x308B;&#x3002;<br/>
            &#x8AB0;&#x3067;&#x3082;&#x4F7F;&#x3048;&#x308B;&#x3001;RPG&#x98A8;AI&#x30EF;&#x30FC;&#x30AF;&#x30D5;&#x30ED;&#x30FC;&#x3002;
          </p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3 stagger-children">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-quest-accent" />}
            title="30秒で完成"
            description="依頼を受注 → 入力 → 完成"
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6 text-quest-primary-light" />}
            title="レベルアップ"
            description="依頼をこなしてXPを獲得"
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-quest-success" />}
            title="安心設計"
            description="誰でも安心して使える"
          />
        </div>

        <div className="rpg-window !p-4 inline-flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="min-w-[200px] font-dot-gothic tracking-wider">
              &#x25B6; &#x5192;&#x967A;&#x3092;&#x59CB;&#x3081;&#x308B;
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="min-w-[200px] font-dot-gothic tracking-wider">
              &#x30ED;&#x30B0;&#x30A4;&#x30F3;
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
    <div className="rpg-window !p-4 text-left transition-all duration-200 hover:shadow-[inset_0_0_0_1px_var(--rpg-window-border-inner),0_0_0_3px_var(--rpg-window-bg-to),0_0_0_5px_var(--rpg-window-border),0_0_16px_rgba(99,102,241,0.2)]">
      <div className="mb-2">{icon}</div>
      <h3 className="mb-1 font-dot-gothic font-bold text-white text-sm">{title}</h3>
      <p className="text-xs text-blue-200/60 font-dot-gothic">{description}</p>
    </div>
  );
}
