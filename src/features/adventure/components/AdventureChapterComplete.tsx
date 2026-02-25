"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Props {
  chapter: number;
  title: string;
  nextChapter?: { number: number; title: string } | null;
}

export function AdventureChapterComplete({ chapter, title, nextChapter }: Props) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-6 text-center">
      <div className="mb-2 text-sm text-muted">第{chapter}章クリア！</div>
      <h3 className="mb-3 text-xl font-bold text-foreground">{title}</h3>

      {nextChapter ? (
        <div className="mt-4">
          <p className="mb-3 text-sm text-muted">次の章: 第{nextChapter.number}章 {nextChapter.title}</p>
          <Link href={`/adventure/chapter/${nextChapter.number}`}>
            <Button>次の章へ</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-quest-accent">おめでとう！最終章を制覇しました！</p>
        </div>
      )}
    </div>
  );
}

