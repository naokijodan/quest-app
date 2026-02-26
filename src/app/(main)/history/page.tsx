import Link from 'next/link';
import { Scroll } from 'lucide-react';
import { getQuestRunsWithQuestInfo } from '@/features/quest/actions';
import { HistoryList } from '@/features/quest/components/HistoryList';
import { RPGWindow } from '@/components/ui/RPGWindow';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const runs = await getQuestRunsWithQuestInfo(50);

  return (
    <div className="space-y-4">
      <RPGWindow variant="status">
        <div className="flex items-center gap-3 font-dot-gothic">
          <Link href="/" className="text-blue-200/40 hover:text-white transition-colors">
            &#x25C0;
          </Link>
          <Scroll className="h-5 w-5 text-rpg-gold" />
          <h1 className="text-base font-bold text-rpg-gold">冒険の記録</h1>
        </div>
      </RPGWindow>

      <HistoryList runs={runs} />
    </div>
  );
}
