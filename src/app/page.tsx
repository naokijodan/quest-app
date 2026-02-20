import Link from 'next/link';
import { Sparkles, Zap, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
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
