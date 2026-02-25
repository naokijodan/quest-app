import { CliSetupGuide } from '@/features/setup/components/CliSetupGuide';

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">セットアップガイド</h1>
        <p className="mt-1 text-sm text-muted">
          Quest AppでAIクエストを実行するための環境設定を行います。
        </p>
      </div>
      <CliSetupGuide />
    </div>
  );
}

