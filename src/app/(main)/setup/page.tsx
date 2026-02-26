import { CliSetupGuide } from '@/features/setup/components/CliSetupGuide';
import { RPGWindow } from '@/components/ui/RPGWindow';

export default function SetupPage() {
  return (
    <div className="space-y-4">
      <RPGWindow variant="status">
        <div className="font-dot-gothic">
          <h1 className="text-base font-bold text-rpg-gold">セットアップガイド</h1>
          <p className="mt-1 text-xs text-blue-200/50">
            Quest AppでAIクエストを実行するための装備を整えます。
          </p>
        </div>
      </RPGWindow>
      <CliSetupGuide />
    </div>
  );
}
