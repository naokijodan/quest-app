'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { playSound } from '@/lib/sound';

const NAV_ITEMS = [
  { href: '/', icon: '\u{1F3F0}', label: '\u30AE\u30EB\u30C9' },
  { href: '/adventure', icon: '\u2694\uFE0F', label: '\u5192\u967A' },
  { href: '/history', icon: '\u{1F4DC}', label: '\u8A18\u9332' },
  { href: '/setup', icon: '\u2699\uFE0F', label: '\u88C5\u5099' },
] as const;

export function GameNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div className="rpg-window !p-0 !rounded-none" style={{ borderLeft: 'none', borderRight: 'none', borderBottom: 'none', boxShadow: 'inset 0 0 0 1px var(--rpg-window-border-inner), 0 -4px 24px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => playSound('cursor')}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 font-dot-gothic transition-all',
                  isActive
                    ? 'text-white scale-110'
                    : 'text-blue-200/60 hover:text-blue-100'
                )}
              >
                <span className={cn('text-lg', isActive && 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]')}>{icon}</span>
                <span className={cn('text-[10px] tracking-wider', isActive && 'text-rpg-gold')}>{label}</span>
                {isActive && (
                  <span className="absolute -top-0.5 text-[8px] text-rpg-gold">{'\u25B6'}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
