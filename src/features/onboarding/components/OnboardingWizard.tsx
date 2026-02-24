'use client';

import { useMemo, useState } from 'react';
import type { AvatarType, MascotType } from '@/types';
import { StepName } from './StepName';
import { StepAvatar } from './StepAvatar';
import { StepMascot } from './StepMascot';
import { StepComplete } from './StepComplete';
import { completeOnboarding } from '@/features/onboarding/actions';

type FormState = {
  username: string;
  avatar_type?: AvatarType;
  mascot_type?: MascotType;
};

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>({ username: '' });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const stepForProgress = useMemo(() => (currentStep > 3 ? 3 : currentStep), [currentStep]);
  const progressPct = useMemo(() => (stepForProgress / 3) * 100, [stepForProgress]);

  function next() {
    setCurrentStep((s) => (s < 4 ? ((s + 1) as typeof s) : s));
  }
  function back() {
    setCurrentStep((s) => (s > 1 ? ((s - 1) as typeof s) : s));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleComplete() {
    if (!form.username || !form.avatar_type || !form.mascot_type) return;
    setSubmitting(true);
    setServerError(null);
    const result = await completeOnboarding({
      username: form.username,
      avatar_type: form.avatar_type,
      mascot_type: form.mascot_type,
    });
    if (result?.error) {
      setServerError(result.error);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setCurrentStep(4);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>
            ステップ {stepForProgress}/3
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-card-border bg-muted-bg">
          <div
            className="h-full bg-quest-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps container with basic transition context */}
      <div className="relative">
        {currentStep === 1 && (
          <div className="transition-all duration-300">
            <StepName
              value={form.username}
              onChange={(v) => update('username', v)}
              onNext={next}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="transition-all duration-300">
            <StepAvatar
              selected={form.avatar_type}
              onSelect={(v) => update('avatar_type', v)}
              onNext={next}
              onBack={back}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="transition-all duration-300">
            <StepMascot
              selected={form.mascot_type}
              onSelect={(v) => update('mascot_type', v)}
              onBack={back}
              onComplete={handleComplete}
              loading={submitting}
              error={serverError}
            />
          </div>
        )}

        {currentStep === 4 && form.avatar_type && form.mascot_type && (
          <div className="transition-all duration-300">
            <StepComplete
              username={form.username}
              avatar_type={form.avatar_type}
              mascot_type={form.mascot_type}
            />
          </div>
        )}
      </div>
    </div>
  );
}
