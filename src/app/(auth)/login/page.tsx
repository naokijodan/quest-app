'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, KeyRound, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  signInWithEmail,
  signInWithMagicLink,
  signInWithGoogle,
} from '@/features/auth/actions';

type LoginMode = 'magic-link' | 'password';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');

  const [mode, setMode] = useState<LoginMode>('magic-link');
  const [error, setError] = useState<string | null>(
    callbackError === 'auth_callback_failed'
      ? '認証に失敗しました。もう一度お試しください'
      : null
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signInWithEmail(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleMagicLink(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signInWithMagicLink(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-quest-primary">
          <Sparkles className="h-7 w-7" />
          <h1 className="text-2xl font-bold">Quest App</h1>
        </div>
        <p className="text-sm text-muted">冒険を始めよう</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-quest-danger/30 bg-quest-danger/10 px-3 py-2 text-sm text-quest-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-quest-success/30 bg-quest-success/10 px-3 py-2 text-sm text-quest-success">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
          icon={<GoogleIcon />}
        >
          Googleでログイン
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-card-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card-bg px-3 text-xs text-muted">
              または
            </span>
          </div>
        </div>

        {mode === 'magic-link' ? (
          <form action={handleMagicLink} className="space-y-3">
            <Input
              name="email"
              type="email"
              label="メールアドレス"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              icon={<Mail className="h-4 w-4" />}
            >
              マジックリンクで送信
            </Button>
          </form>
        ) : (
          <form action={handleEmailLogin} className="space-y-3">
            <Input
              name="email"
              type="email"
              label="メールアドレス"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label="パスワード"
              placeholder="8文字以上"
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              icon={<KeyRound className="h-4 w-4" />}
            >
              ログイン
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'magic-link' ? 'password' : 'magic-link');
            setError(null);
            setSuccess(null);
          }}
          className="w-full text-center text-xs text-muted hover:text-foreground transition-colors"
        >
          {mode === 'magic-link'
            ? 'パスワードでログイン'
            : 'マジックリンクでログイン'}
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-muted">
        アカウントがない方は{' '}
        <Link
          href="/register"
          className="font-medium text-quest-primary hover:text-quest-primary-hover transition-colors"
        >
          新規登録
        </Link>
      </div>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
