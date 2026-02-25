import { getUserProfile } from '@/features/quest/actions';
import { calculateLevel } from '@/features/gamification/types';
import { CHAPTERS } from '@/features/adventure/types';
import { WorldMap } from '@/features/adventure/components/WorldMap';
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
      const chapterProgress = progress.filter((p) => p.chapter === c.number);
      const completed = chapterProgress.length > 0 && chapterProgress.every((p) => p.status === 'completed');
      const current = user.adventure_chapter === c.number;
      const locked = level < c.requiredLevel;
      const first = qs[0]?.quest_identifier;
      const href = !locked && first
        ? `/adventure/${c.number}/${encodeURIComponent(first)}`
        : undefined;

      return {
        chapter: c,
        locked,
        current,
        completed,
        href,
        totalQuests,
        completedQuests,
      };
    })
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-quest-primary/20 text-2xl torch-flicker">
          🗺️
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">冒険の地図</h1>
          <p className="text-sm text-muted">ターミナルの魔王を倒す旅へ。拠点を辿って進もう。</p>
        </div>
      </div>

      {/* World Map */}
      <WorldMap chapters={chapterData} />

      <div className="rounded-lg border border-card-border bg-card-bg/50 px-4 py-3 text-xs text-muted">
        現在 Lv.{level} — レベルアップで新しい拠点が解放されます。
      </div>
    </div>
  );
}
