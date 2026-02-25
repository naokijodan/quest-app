'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scroll, Sword, Wrench, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'ギルド', shortLabel: 'ギルド' },
  { href: '/adventure', icon: Sword, label: '冒険に出る', shortLabel: '冒険' },
  { href: '/history', icon: Scroll, label: '冒険の記録', shortLabel: '記録' },
  { href: '/setup', icon: Wrench, label: '装備', shortLabel: '装備' },
] as const;

export function GameNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-card-border bg-card-bg/95 backdrop-blur sm:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map(({ href, icon: Icon, shortLabel }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
                isActive
                  ? 'text-quest-primary'
                  : 'text-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]')} />
              <span className="text-[10px] font-medium">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
