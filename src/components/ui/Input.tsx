'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-base font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-card-bg px-3 py-2 text-sm text-foreground',
            'placeholder:text-muted',
            'transition-colors',
            'focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-focus/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-quest-danger' : 'border-input-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-quest-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-base font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-card-bg px-3 py-2 text-sm text-foreground',
            'placeholder:text-muted',
            'transition-colors resize-y min-h-[80px]',
            'focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-focus/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-quest-danger' : 'border-input-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-quest-danger">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
