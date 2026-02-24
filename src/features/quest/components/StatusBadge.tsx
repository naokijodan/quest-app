import type { QuestRunStatus } from '@/types';

const STATUS_CONFIG: Record<QuestRunStatus, { label: string; className: string }> = {
  pending: { label: '待機中', className: 'bg-quest-accent/10 text-quest-accent' },
  running: { label: '実行中', className: 'bg-quest-info/10 text-quest-info' },
  completed: { label: '完了', className: 'bg-quest-success/10 text-quest-success' },
  failed: { label: '失敗', className: 'bg-quest-danger/10 text-quest-danger' },
  cancelled: { label: 'キャンセル', className: 'bg-muted-bg text-muted' },
};

interface Props {
  status: QuestRunStatus;
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

