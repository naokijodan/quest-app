import { Zap } from 'lucide-react';

interface Props {
  used: number;
  limit: number;
}

export function DailyQuota({ used, limit }: Props) {
  const remaining = Math.max(0, limit - used);
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isLow = remaining <= 2;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-card-border bg-card-bg px-3 py-2">
      <Zap className={`h-4 w-4 ${isLow ? 'text-quest-danger' : 'text-quest-accent'}`} />
      <div className="text-sm">
        <span className={`font-medium ${isLow ? 'text-quest-danger' : 'text-foreground'}`}>
          残り {remaining} 回
        </span>
        <span className="text-muted"> / {limit} 回（今日）</span>
      </div>
      <div className="ml-2 h-1.5 w-16 overflow-hidden rounded-full bg-muted-bg">
        <div
          className={`h-full rounded-full transition-all ${isLow ? 'bg-quest-danger' : 'bg-quest-accent'}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

