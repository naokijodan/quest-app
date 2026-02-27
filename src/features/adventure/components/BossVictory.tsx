"use client";
import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface BossVictoryProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

type ParticleKind = 'sparkle' | 'confetti' | 'star';

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
}

const CONFETTI_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const kinds: ParticleKind[] = ['sparkle', 'confetti', 'star'];
    const kind = kinds[i % kinds.length];
    return {
      kind,
      x: (i * 37 + i * i * 7) % 100,
      y: -10 - (i % 5) * 15,
      delay: (i * 0.08) % 2.5,
      duration: 2.5 + (i % 4) * 0.5,
      size: kind === 'star' ? 14 + (i % 3) * 4 : kind === 'confetti' ? 8 + (i % 3) * 3 : 4 + (i % 4) * 2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotation: (i * 47) % 360,
    };
  });
}

function StarShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ParticleElement({ particle }: { particle: Particle }) {
  const targetY = 110 + (particle.x % 30);

  if (particle.kind === 'star') {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
        initial={{ opacity: 0, y: 0, rotate: 0, scale: 0.3 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [0, targetY * 3, targetY * 6],
          rotate: [0, particle.rotation, particle.rotation * 2],
          scale: [0.3, 1, 0.5],
        }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      >
        <StarShape size={particle.size} color={particle.color} />
      </motion.div>
    );
  }

  if (particle.kind === 'confetti') {
    return (
      <motion.div
        className="absolute pointer-events-none rounded-sm"
        style={{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size * 0.6,
          backgroundColor: particle.color,
        }}
        initial={{ opacity: 0, y: 0, rotate: 0, x: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [0, targetY * 3, targetY * 7],
          x: [0, (particle.rotation % 60) - 30, (particle.rotation % 80) - 40],
          rotate: [0, particle.rotation * 2, particle.rotation * 4],
        }}
        transition={{
          duration: particle.duration * 1.2,
          delay: particle.delay,
          repeat: Infinity,
          ease: 'easeIn',
        }}
      />
    );
  }

  // sparkle
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}80`,
      }}
      initial={{ opacity: 0, y: 0, scale: 0.6 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -20, -50],
        scale: [0.6, 1.2, 0.4],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function BossVictory({ open, onClose, username }: BossVictoryProps) {
  const particles = useMemo(() => generateParticles(36), []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="勝利"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-black/85" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-quest-primary/15 via-transparent to-quest-accent/15"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p, idx) => (
              <ParticleElement key={idx} particle={p} />
            ))}
          </div>

          {/* Content */}
          <div className="relative mx-4 flex max-w-3xl flex-col items-center text-center">
            <motion.div
              className="mb-4 bg-gradient-to-r from-quest-accent via-white to-quest-primary bg-clip-text text-5xl font-extrabold tracking-widest text-transparent drop-shadow sm:text-6xl"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                scale: { type: 'spring', stiffness: 200, damping: 15 },
              }}
            >
              ターミナルマスター
            </motion.div>

            <motion.p
              className="mb-10 text-lg text-white/90 sm:text-xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            >
              {username}はターミナルを克服した！
            </motion.p>

            <motion.div
              className="flex flex-col items-center gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
            >
              <Link href="/history">
                <Button size="lg" className="min-w-[180px] shadow-lg">
                  冒険の記録を見る
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" size="lg" className="min-w-[160px] text-white bg-white/10 hover:bg-white/20 border-white/20">
                  ホームに戻る
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
