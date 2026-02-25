"use client";
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface Props {
  open: boolean;
  text: string;
  onNext: () => void;
  title?: string;
  typingSpeed?: number; // ms per char
}

export function StoryDialog({ open, text, onNext, title, typingSpeed = 20 }: Props) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!open) return;
    setDisplayed('');
    let i = 0;
    const chars = (text ?? '').replace(/\\n/g, '\n');
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      if (i <= chars.length) {
        setDisplayed(chars.slice(0, i));
        i += 1;
        setTimeout(step, typingSpeed);
      }
    };
    step();
    return () => {
      cancelled = true;
    };
  }, [open, text, typingSpeed]);

  return (
    <Modal open={open} onClose={onNext} title={title ?? 'ストーリー'}>
      <div className="space-y-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{displayed}</p>
        <div className="flex justify-end">
          <Button onClick={onNext}>次へ</Button>
        </div>
      </div>
    </Modal>
  );
}

