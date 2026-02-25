import { getUserProfile } from '@/features/quest/actions';
import { calculateLevel } from '@/features/gamification/types';
import { CHAPTERS } from '@/features/adventure/types';
import { ChapterCard } from '@/features/adventure/components/ChapterCard';
import { getAdventureProgress, getAdventureQuests } from '@/features/adventure/actions';

export const dynamic = 'force-dynamic';

export default async function AdventurePage() {
  const user = await getUserProfile();
  if (!user) return null;

  const level = typeof user.level === 'number' ? user.level : calculateLevel(user.experience_points);
  const progress = await getAdventureProgress();

  const chapterData = await Promise.all(
    CHAPTERS.map(async (c) => {
      const qs = await getAdventureQuests(c.number);
      const totalQuests = qs.length;
      const completedQuests = qs.filter((q) => q.progress?.status === 'completed').length;
      return {
        chapter: c.number,
        first: qs[0]?.quest_identifier,
        totalQuests,
        completedQuests,
      };
    })
  );
  const dataMap = new Map(chapterData.map((x) => [x.chapter, x] as const));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">冒険ルート</h1>
        <p className="mt-1 text-sm text-muted">ターミナルの魔王を倒す旅へ。章を選んで進もう。</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 stagger-children">
        {CHAPTERS.map((c) => {
          const locked = level < c.requiredLevel;
          const chapterProgress = progress.filter((p) => p.chapter === c.number);
          const completed = chapterProgress.length > 0 && chapterProgress.every((p) => p.status === 'completed');
          const current = user.adventure_chapter === c.number;
          const data = dataMap.get(c.number);
          const href = !locked && data?.first
            ? `/adventure/${c.number}/${encodeURIComponent(data.first)}`
            : undefined;
          return (
            <ChapterCard
              key={c.number}
              chapter={c}
              locked={locked}
              current={current}
              completed={completed}
              href={href}
              totalQuests={data?.totalQuests ?? 0}
              completedQuests={data?.completedQuests ?? 0}
            />
          );
        })}
      </div>

      <div className="text-xs text-muted">
        Lv.{level} 以上で次の章が解放されます。
      </div>
    </div>
  );
}
