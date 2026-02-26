'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  const durationSec = duration / 1000;

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), duration);
    return () => clearTimeout(timer);
  }, [pathname, duration]);

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className={cn('rpg-transition-overlay', `rpg-transition-${type}`)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durationSec / 2 }}
            style={{ animationDuration: `${duration}ms` }}
          />
        )}
      </AnimatePresence>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: durationSec / 2, delay: durationSec / 4 }}
      >
        {children}
      </motion.div>
    </>
  );
}
