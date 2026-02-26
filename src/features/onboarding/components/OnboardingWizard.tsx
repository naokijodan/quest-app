'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AvatarType, MascotType } from '@/types';
import { StepName } from './StepName';
import { StepAvatar } from './StepAvatar';
import { StepMascot } from './StepMascot';
import { StepComplete } from './StepComplete';
import { completeOnboarding } from '@/features/onboarding/actions';
import { RPGWindow } from '@/components/ui/RPGWindow';

type FormState = {
  username: string;
  avatar_type?: AvatarType;
  mascot_type?: MascotType;
};

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>({ username: '' });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const stepForProgress = useMemo(() => (currentStep > 3 ? 3 : currentStep), [currentStep]);

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
      {/* RPG Progress Bar */}
      <RPGWindow variant="status" className="mb-4">
        <div className="flex items-center justify-between font-dot-gothic text-xs text-blue-200/70">
          <span>冒険者登録 ステップ {stepForProgress}/3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2.5 w-8 rounded-sm border ${
                  s <= stepForProgress
                    ? 'border-rpg-gold/60 bg-rpg-gold/80'
                    : 'border-blue-200/20 bg-blue-900/30'
                } transition-all duration-300`}
              />
            ))}
          </div>
        </div>
      </RPGWindow>

      {/* Steps container with AnimatePresence */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step-1" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <StepName
                value={form.username}
                onChange={(v) => update('username', v)}
                onNext={next}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step-2" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <StepAvatar
                selected={form.avatar_type}
                onSelect={(v) => update('avatar_type', v)}
                onNext={next}
                onBack={back}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step-3" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <StepMascot
                selected={form.mascot_type}
                onSelect={(v) => update('mascot_type', v)}
                onBack={back}
                onComplete={handleComplete}
                loading={submitting}
                error={serverError}
              />
            </motion.div>
          )}

          {currentStep === 4 && form.avatar_type && form.mascot_type && (
            <motion.div key="step-4" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <StepComplete
                username={form.username}
                avatar_type={form.avatar_type}
                mascot_type={form.mascot_type}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
