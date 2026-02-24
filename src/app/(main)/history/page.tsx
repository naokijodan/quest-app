import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';
import { getQuestRunsWithQuestInfo } from '@/features/quest/actions';
import { HistoryList } from '@/features/quest/components/HistoryList';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const runs = await getQuestRunsWithQuestInfo(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-quest-primary" />
          <h1 className="text-2xl font-bold text-foreground">クエスト履歴</h1>
        </div>
      </div>

      <HistoryList runs={runs} />
    </div>
  );
}

