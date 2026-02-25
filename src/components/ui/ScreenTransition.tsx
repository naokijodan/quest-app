'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

type TransitionType = 'fade' | 'wipe-left' | 'wipe-down';

interface Props {
  type?: TransitionType;
  duration?: number;
  children: React.ReactNode;
}

export function ScreenTransition({ type = 'fade', duration = 300, children }: Props) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    setIsTransitioning(true);
    setShowContent(false);

    const showTimer = setTimeout(() => {
      setShowContent(true);
    }, duration / 2);

    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, duration]);

  return (
    <>
      {/* Transition overlay */}
      {isTransitioning && (
        <div
          className={cn('rpg-transition-overlay', `rpg-transition-${type}`)}
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
      {/* Content */}
      <div
        className={cn(
          'transition-opacity',
          showContent ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transitionDuration: `${duration / 2}ms` }}
      >
        {children}
      </div>
    </>
  );
}
