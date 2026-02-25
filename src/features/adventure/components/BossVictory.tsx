"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface BossVictoryProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

export function BossVictory({ open, onClose, username }: BossVictoryProps) {
  if (!open) return null;

  const particles = Array.from({ length: 24 }).map((_, i) => ({
    left: `${(i * 37) % 100}%`,
    top: `${(i * 53) % 100}%`,
    delay: `${(i * 150) % 2000}ms`,
    duration: `${2000 + (i % 6) * 300}ms`,
    size: `${6 + (i % 4) * 2}px`,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="勝利"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Background pulse */}
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-quest-primary/10 via-transparent to-quest-accent/10 animate-bg-pulse" />

      {/* Sparkle particles */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((p, idx) => (
          <span
            key={idx}
            className="absolute rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-sparkle"
            style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration, width: p.size, height: p.size }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative mx-4 flex max-w-3xl flex-col items-center text-center">
        <div className="victory-title mb-4 bg-gradient-to-r from-quest-accent via-white to-quest-primary bg-clip-text text-5xl font-extrabold tracking-widest text-transparent drop-shadow sm:text-6xl">
          ターミナルマスター
        </div>
        <p className="mb-10 text-lg text-white/90 sm:text-xl animate-sub-fade">
          {username}はターミナルを克服した！
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
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
        </div>
      </div>

      <style jsx>{`
        @keyframes bg-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-bg-pulse { animation: bg-pulse 3s ease-in-out infinite; }

        @keyframes title-pop {
          0% { opacity: 0; transform: scale(0.9); text-shadow: 0 0 0 rgba(255,255,255,0); }
          60% { opacity: 1; transform: scale(1.04); text-shadow: 0 0 24px rgba(255,255,255,0.35); }
          100% { opacity: 1; transform: scale(1); text-shadow: 0 0 12px rgba(255,255,255,0.25); }
        }
        .victory-title { animation: title-pop 800ms ease-out both; }

        @keyframes sub-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-sub-fade { animation: sub-fade 700ms ease-out 300ms both; }

        @keyframes sparkle {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          20% { opacity: 1; transform: translateY(-8px) scale(1); }
          80% { opacity: 1; transform: translateY(-24px) scale(1); }
          100% { opacity: 0; transform: translateY(-34px) scale(0.8); }
        }
        .animate-sparkle { animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
      `}</style>
    </div>
  );
}

