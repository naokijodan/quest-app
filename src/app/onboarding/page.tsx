import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user!.id)
    .single();

  const completed = error?.code === 'PGRST116'
    ? false
    : Boolean(profile?.onboarding_completed);

  if (completed) {
    redirect('/');
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Guild hall background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: 'url(/sprites/guild-hall-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl p-4 sm:p-6">
        <OnboardingWizard />
      </div>
    </div>
  );
}
