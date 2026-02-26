'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { RPGWindow } from '@/components/ui/RPGWindow';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { playSound } from '@/lib/sound';
import type { AvatarType, MascotType } from '@/types';
import { useRouter } from 'next/navigation';

const AVATAR_SPRITES: Record<AvatarType, string> = {
  planner: '/sprites/avatar-planner.png',
  explorer: '/sprites/avatar-explorer.png',
  crafter: '/sprites/avatar-crafter.png',
};
const MASCOT_SPRITES: Record<MascotType, string> = {
  cat: '/sprites/mascot-cat.png',
  dog: '/sprites/mascot-cat-mage.png',
};

interface StepCompleteProps {
  username: string;
  avatar_type: AvatarType;
  mascot_type: MascotType;
}

export function StepComplete({ username, avatar_type, mascot_type }: StepCompleteProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    playSound('questComplete');
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  function handleStart() {
    playSound('confirm');
    router.push('/adventure/0/ch0-weapon-check');
  }

  return (
    <div className="w-full">
      <RPGWindow
        className={
          'mx-auto max-w-xl text-center transition-all duration-500 ' +
          (mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0')
        }
      >
        <div className="mb-4">
          <span className="mb-2 block text-4xl">&#x2728;</span>
          <h2 className="font-dot-gothic text-base font-bold text-rpg-gold">
            プロフィール作成完了！
          </h2>
          <TypewriterText
            text="次は旅の準備（第0章）へ進みましょう。"
            speed={35}
            className="mt-1 text-xs text-blue-200/60"
            showCursor={false}
          />
        </div>

        <div className="my-4 flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="relative mx-auto h-20 w-14">
              <Image src={AVATAR_SPRITES[avatar_type]} alt={mapAvatarLabel(avatar_type)} fill className="object-contain" style={{ imageRendering: 'pixelated' }} sizes="56px" />
            </div>
            <span className="font-dot-gothic text-[10px] text-blue-200/50">アバター</span>
          </div>
          <div className="text-center">
            <div className="relative mx-auto h-20 w-14">
              <Image src={MASCOT_SPRITES[mascot_type]} alt={mapMascotLabel(mascot_type)} fill className="object-contain" style={{ imageRendering: 'pixelated' }} sizes="56px" />
            </div>
            <span className="font-dot-gothic text-[10px] text-blue-200/50">マスコット</span>
          </div>
        </div>

        <RPGWindow variant="status" className="mx-auto w-full max-w-md text-left">
          <div className="space-y-2 font-dot-gothic text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-200/50">名前</span>
              <span className="text-white">{username}</span>
            </div>
            <div className="h-px bg-blue-200/10" />
            <div className="flex items-center justify-between">
              <span className="text-blue-200/50">アバター</span>
              <span className="text-white">{mapAvatarLabel(avatar_type)}</span>
            </div>
            <div className="h-px bg-blue-200/10" />
            <div className="flex items-center justify-between">
              <span className="text-blue-200/50">マスコット</span>
              <span className="text-white">{mapMascotLabel(mascot_type)}</span>
            </div>
          </div>
        </RPGWindow>

        <Button size="lg" onClick={handleStart} className="font-dot-gothic tracking-wider">
          &#x25B6; 旅の準備を始める
        </Button>
      </RPGWindow>
    </div>
  );
}

function mapAvatarLabel(a: AvatarType) {
  switch (a) {
    case 'planner':
      return '\u{1F9D9}\u200D\u2642\uFE0F プランナー';
    case 'explorer':
      return '\u2694\uFE0F エクスプローラー';
    case 'crafter':
      return '\u{1F6E0}\uFE0F クラフター';
  }
}

function mapMascotLabel(m: MascotType) {
  switch (m) {
    case 'cat':
      return '\u{1F431} ネコ';
    case 'dog':
      return '\u{1F436} イヌ';
  }
}
