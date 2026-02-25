'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import type { AvatarType, MascotType } from '@/types';
import { useRouter } from 'next/navigation';

interface StepCompleteProps {
  username: string;
  avatar_type: AvatarType;
  mascot_type: MascotType;
}

export function StepComplete({ username, avatar_type, mascot_type }: StepCompleteProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full">
      <Card
        className={
          'mx-auto max-w-xl bg-card-bg text-center transition-all duration-500 ' +
          (mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0')
        }
        padding="lg"
      >
        <CardHeader className="mb-4">
          <CardTitle>プロフィール作成完了！</CardTitle>
          <CardDescription>次は旅の準備（第0章）へ進みましょう。</CardDescription>
        </CardHeader>

        <div className="mx-auto my-4 w-full max-w-md rounded-lg border border-card-border bg-card-bg p-4 text-left">
          <div className="mb-2 text-sm text-muted">名前</div>
          <div className="mb-3 text-foreground">{username}</div>
          <div className="mb-2 text-sm text-muted">アバター</div>
          <div className="mb-3 text-foreground">{mapAvatarLabel(avatar_type)}</div>
          <div className="mb-2 text-sm text-muted">マスコット</div>
          <div className="text-foreground">{mapMascotLabel(mascot_type)}</div>
        </div>

        <Button size="lg" onClick={() => router.push('/adventure/0/ch0-weapon-check')}>旅の準備を始める</Button>
      </Card>
    </div>
  );
}

function mapAvatarLabel(a: AvatarType) {
  switch (a) {
    case 'planner':
      return 'プランナー 🧙‍♂️';
    case 'explorer':
      return 'エクスプローラー ⚔️';
    case 'crafter':
      return 'クラフター 🛠️';
  }
}

function mapMascotLabel(m: MascotType) {
  switch (m) {
    case 'cat':
      return 'ネコ 🐱';
    case 'dog':
      return 'イヌ 🐶';
  }
}

