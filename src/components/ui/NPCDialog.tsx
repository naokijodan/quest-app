'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { RPGWindow } from '@/components/ui/RPGWindow';

interface NPCDialogProps {
  character?: 'sage' | 'wizard';
  message: string;
  npcName?: string;
  onComplete?: () => void;
  typingSpeed?: number;
  className?: string;
}

const spriteConfig = {
  sage: {
    src: '/sprites/rpg-sprites.png',
    alt: 'ギルドマスター',
    style: {
      imageRendering: 'pixelated' as const,
      width: '500%',
      height: '500%',
      objectFit: 'none' as const,
      objectPosition: '-5% -52%',
      transform: 'scale(0.42)',
      transformOrigin: 'top left',
    },
  },
  wizard: {
    src: '/sprites/npc-wizard.png',
    alt: '魔法使い',
    style: {
      imageRendering: 'pixelated' as const,
      width: '100%',
      height: '100%',
      objectFit: 'contain' as const,
    },
  },
};

const spriteVariants = {
  hidden: { opacity: 0, scale: 0.3, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
};

const bubbleVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

const idleFloat = {
  y: [0, -4, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

export function NPCDialog({
  character = 'sage',
  message,
  npcName = 'ギルドマスター',
  onComplete,
  typingSpeed = 35,
  className,
}: NPCDialogProps) {
  const [showBubble, setShowBubble] = useState(false);
  const sprite = spriteConfig[character];

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative flex items-start gap-3 ${className ?? ''}`}>
      {/* NPC sprite with bounce-in + idle float */}
      <motion.div
        className="relative shrink-0 w-14 h-14"
        variants={spriteVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="absolute inset-0 overflow-hidden border-2 border-rpg-gold/40 bg-blue-900/50"
          style={{ imageRendering: 'pixelated' }}
          animate={idleFloat}
        >
          <Image
            src={sprite.src}
            alt={sprite.alt}
            width={1024}
            height={1024}
            className="absolute"
            style={sprite.style}
            priority
          />
        </motion.div>
        {/* Breathing glow */}
        <div className="absolute inset-0 border-2 border-rpg-gold/20 rpg-border-glow pointer-events-none" />
      </motion.div>

      {/* Speech bubble with fade-in */}
      {showBubble && (
        <motion.div
          className="flex-1"
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
        >
          <RPGWindow variant="message" className="flex-1">
            <span className="font-dot-gothic text-xs text-rpg-gold block mb-1">
              {npcName}
            </span>
            <TypewriterText
              text={message}
              speed={typingSpeed}
              className="text-sm text-blue-100"
              onComplete={onComplete}
            />
          </RPGWindow>
        </motion.div>
      )}
    </div>
  );
}
