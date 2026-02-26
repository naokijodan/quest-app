'use client';

import Image from 'next/image';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { RPGWindow } from '@/components/ui/RPGWindow';

interface Props {
  username: string;
  level: number;
}

const NPC_MESSAGES: Record<number, string[]> = {
  1: [
    'ようこそ、新米冒険者よ。まずは簡単な依頼から始めるのじゃ。',
    'おぬし、まだ駆け出しじゃな。掲示板の依頼を確認するがよい。',
    'ふむ…新しい顔じゃな。このギルドでは依頼をこなしてXPを稼ぐのじゃ。',
  ],
  2: [
    'おお、腕を上げたな！新しい依頼が解放されたぞ。',
    'ビジネスの依頼も受けられるようになったか。成長したのう。',
    'Lv.2か…まだまだ先は長いぞ。精進せよ。',
  ],
  3: [
    'なかなかの冒険者じゃ。すべての依頼が受けられるぞ。',
    '全カテゴリ解放！おぬしの実力は本物じゃ。',
  ],
};

function getNPCMessage(level: number): string {
  const messages = NPC_MESSAGES[Math.min(level, 3)] ?? NPC_MESSAGES[3]!;
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

export function GuildBoardNPC({ username, level }: Props) {
  const message = getNPCMessage(level);

  return (
    <div className="relative flex items-start gap-3">
      {/* NPC sprite - old sage from sprite sheet */}
      <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14">
        <div className="absolute inset-0 overflow-hidden border-2 border-rpg-gold/40 bg-blue-900/50" style={{ imageRendering: 'pixelated' }}>
          <Image
            src="/sprites/rpg-sprites.png"
            alt="ギルドマスター"
            width={1024}
            height={1024}
            className="absolute"
            style={{
              imageRendering: 'pixelated',
              width: '500%',
              height: '500%',
              objectFit: 'none',
              objectPosition: '-5% -52%',
              transform: 'scale(0.42)',
              transformOrigin: 'top left',
            }}
            priority
          />
        </div>
        {/* Breathing glow */}
        <div className="absolute inset-0 border-2 border-rpg-gold/20 rpg-border-glow pointer-events-none" />
      </div>

      <RPGWindow variant="message" className="flex-1">
        <span className="font-dot-gothic text-[10px] text-rpg-gold block mb-1">ギルドマスター</span>
        <TypewriterText
          text={message}
          speed={35}
          className="text-sm text-blue-100"
        />
      </RPGWindow>
    </div>
  );
}
