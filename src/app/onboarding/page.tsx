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
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <OnboardingWizard />
    </div>
  );
}
