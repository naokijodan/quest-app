'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { playSound } from '@/lib/sound';

interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

interface Props {
  items: MenuItem[];
  onSelect: (id: string) => void;
  onCancel?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function RPGMenu({ items, onSelect, onCancel, className, autoFocus = true }: Props) {
  const [cursor, setCursor] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveCursor = useCallback((direction: 1 | -1) => {
    setCursor((prev) => {
      let next = prev + direction;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;

      // Skip disabled items
      let attempts = 0;
      while (items[next]?.disabled && attempts < items.length) {
        next = next + direction;
        if (next < 0) next = items.length - 1;
        if (next >= items.length) next = 0;
        attempts++;
      }

      playSound('cursor');
      return next;
    });
  }, [items]);

  const confirmSelection = useCallback(() => {
    const item = items[cursor];
    if (item && !item.disabled) {
      playSound('confirm');
      onSelect(item.id);
    }
  }, [items, cursor, onSelect]);

  const cancelMenu = useCallback(() => {
    if (onCancel) {
      playSound('cancel');
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    if (!autoFocus) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          moveCursor(-1);
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          moveCursor(1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          confirmSelection();
          break;
        case 'Escape':
          e.preventDefault();
          cancelMenu();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoFocus, moveCursor, confirmSelection, cancelMenu]);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      ref={containerRef}
      className={cn('rpg-menu font-dot-gothic', className)}
      role="listbox"
      tabIndex={0}
      aria-activedescendant={items[cursor]?.id}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          id={item.id}
          role="option"
          aria-selected={index === cursor}
          aria-disabled={item.disabled}
          className={cn(
            'rpg-menu-item',
            index === cursor && 'rpg-menu-item-active',
            item.disabled && 'rpg-menu-item-disabled'
          )}
          onClick={() => {
            if (!item.disabled) {
              setCursor(index);
              playSound('confirm');
              onSelect(item.id);
            }
          }}
          onMouseEnter={() => {
            if (!item.disabled && index !== cursor) {
              setCursor(index);
              playSound('cursor');
            }
          }}
        >
          <span className="rpg-menu-cursor" aria-hidden="true">
            {index === cursor ? '\u25B6' : '\u00A0\u00A0'}
          </span>
          {item.icon && <span className="rpg-menu-icon">{item.icon}</span>}
          <span className="rpg-menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
