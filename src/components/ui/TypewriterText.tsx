'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface Props {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
  autoStart?: boolean;
}

export function TypewriterText({
  text,
  speed = 40,
  className,
  onComplete,
  showCursor = true,
  autoStart = true,
}: Props) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const skipToEnd = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayedLength(text.length);
    setIsComplete(true);
    onComplete?.();
  }, [text.length, onComplete]);

  useEffect(() => {
    if (!isStarted) return;

    if (displayedLength >= text.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsComplete(true);
          onComplete?.();
          return text.length;
        }
        return next;
      });
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed, isStarted, onComplete, displayedLength]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedLength(0);
    setIsComplete(false);
    setIsStarted(autoStart);
  }, [text, autoStart]);

  const handleClick = useCallback(() => {
    if (!isStarted) {
      setIsStarted(true);
      return;
    }
    if (!isComplete) {
      skipToEnd();
    }
  }, [isStarted, isComplete, skipToEnd]);

  return (
    <div
      className={cn('font-dot-gothic typewriter-container cursor-pointer select-none', className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span>{text.slice(0, displayedLength)}</span>
      {showCursor && !isComplete && (
        <span className="typewriter-cursor" aria-hidden="true" />
      )}
      {showCursor && isComplete && (
        <span className="typewriter-next-indicator" aria-hidden="true">
          {'\u25BC'}
        </span>
      )}
    </div>
  );
}
