"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface TerminalLine {
  type: 'command' | 'output' | 'system' | 'error';
  content: string;
}

interface TerminalProps {
  lines: TerminalLine[];
  onCommand?: (command: string) => void;
  interactive?: boolean;
  className?: string;
  typingEffect?: boolean;
  typingSpeed?: number; // ms per character, default: 30
}

export function Terminal({
  lines,
  onCommand,
  interactive = false,
  className,
  typingEffect = false,
  typingSpeed = 30,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState('');

  // Typing effect state
  const [typedIndex, setTypedIndex] = useState(typingEffect ? 0 : lines.length);
  const [typedContent, setTypedContent] = useState<string>('');

  // Reset typing when input lines change
  useEffect(() => {
    if (!typingEffect) return;
    setTypedIndex(0);
    setTypedContent('');
  }, [lines, typingEffect]);

  // Typing loop
  useEffect(() => {
    if (!typingEffect) return;

    let cancelled = false;
    let timeout: NodeJS.Timeout | null = null;

    const tick = () => {
      if (cancelled) return;
      if (typedIndex >= lines.length) return;
      const current = lines[typedIndex]?.content ?? '';
      const nextCharIndex = typedContent.length;
      if (nextCharIndex < current.length) {
        setTypedContent(current.slice(0, nextCharIndex + 1));
        timeout = setTimeout(tick, Math.max(typingSpeed, 5));
      } else {
        // Move to next line
        setTypedIndex((i) => i + 1);
        setTypedContent('');
        timeout = setTimeout(tick, Math.max(typingSpeed, 5));
      }
    };

    timeout = setTimeout(tick, Math.max(typingSpeed, 5));
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [lines, typedIndex, typedContent, typingEffect, typingSpeed]);

  const visibleLines: TerminalLine[] = useMemo(() => {
    if (!typingEffect) return lines;
    const head = lines.slice(0, typedIndex);
    if (typedIndex < lines.length) {
      return [...head, { type: lines[typedIndex].type, content: typedContent }];
    }
    return head;
  }, [lines, typedIndex, typedContent, typingEffect]);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleLines.length, typedContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    onCommand?.(cmd);
    setInput('');
  };

  const colorFor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-[#a9b1d6]';
      case 'error':
        return 'text-[#f7768e]';
      case 'system':
        return 'text-[#e0af68]';
      default:
        return 'text-[#a9b1d6]';
    }
  };

  return (
    <div
      className={cn(
        'flex h-80 flex-col overflow-hidden rounded-lg border border-[#24283b] bg-[#1a1b26] text-[#a9b1d6]',
        className
      )}
    >
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4"
      >
        {visibleLines.map((line, i) => (
          <div key={i} className={cn('whitespace-pre-wrap break-words font-mono text-sm', colorFor(line.type))}>
            {line.type === 'command' ? (
              <span>
                <span className="text-[#9ece6a]">$ </span>
                {line.content}
              </span>
            ) : (
              <span>{line.content}</span>
            )}
          </div>
        ))}
      </div>

      {interactive && (
        <form onSubmit={handleSubmit} className="border-t border-[#24283b] p-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[#9ece6a]">$</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent font-mono text-sm text-[#a9b1d6] outline-none placeholder:text-[#565f89]"
              placeholder="コマンドを入力してEnter..."
            />
          </div>
        </form>
      )}
    </div>
  );
}

