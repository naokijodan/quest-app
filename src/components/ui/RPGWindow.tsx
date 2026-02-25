'use client';

import { cn } from '@/lib/utils/cn';

type RPGWindowVariant = 'default' | 'message' | 'menu' | 'status';

interface Props {
  variant?: RPGWindowVariant;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

const variantStyles: Record<RPGWindowVariant, string> = {
  default: 'p-4 sm:p-5',
  message: 'p-3 sm:p-4',
  menu: 'p-2 sm:p-3',
  status: 'px-3 py-1.5 sm:px-4 sm:py-2',
};

export function RPGWindow({ variant = 'default', className, children, title }: Props) {
  return (
    <div
      className={cn(
        'rpg-window',
        variantStyles[variant],
        className
      )}
    >
      {title && (
        <div className="rpg-window-title">
          <span className="rpg-window-title-text">{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}
