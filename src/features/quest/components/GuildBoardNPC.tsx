'use client';

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
    <div className="relative">
      {/* NPC icon */}
      <div className="absolute -left-1 -top-3 z-10 text-2xl" aria-hidden="true">
        &#x1F9D9;
      </div>

      <RPGWindow variant="message" className="ml-8">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <span className="font-dot-gothic text-[10px] text-rpg-gold block mb-1">ギルドマスター</span>
            <TypewriterText
              text={message}
              speed={35}
              className="text-sm text-blue-100"
            />
          </div>
        </div>
      </RPGWindow>
    </div>
  );
}
