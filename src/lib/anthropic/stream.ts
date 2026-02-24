import type Anthropic from '@anthropic-ai/sdk';
import { getAnthropicClient } from './client';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PREFIX = [
  'You are Quest App\'s AI assistant.',
  'Follow the user\'s template and constraints exactly.',
  'Respond only with the requested output, no preface or explanation.',
  'Keep formatting clean and deterministic.',
].join(' ');

export interface StreamOptions {
  prompt: string; // rendered prompt (template applied)
  maxTokens: number;
  model?: string;
}

export interface StreamHandle {
  stream: AsyncGenerator<string>;
  finalUsage: () => Promise<{ inputTokens: number; outputTokens: number; totalTokens: number }>;
  cancel: () => void;
}

// Anthropic ストリーミング呼び出しのヘルパー
// - system prompt: 固定プリフィックス + ユーザーのプロンプト
// - streamイベントを AsyncGenerator<string> で返す
export async function startTextStream(options: StreamOptions): Promise<StreamHandle> {
  const client = getAnthropicClient();
  const model = options.model ?? DEFAULT_MODEL;

  const system = `${SYSTEM_PREFIX}\n\n${options.prompt}`;

  const stream = await (client as Anthropic).messages.create({
    model,
    max_tokens: options.maxTokens,
    system,
    messages: [
      {
        role: 'user',
        content: 'Generate the final answer exactly as instructed.',
      },
    ],
    stream: true,
  });

  async function* iterator(): AsyncGenerator<string> {
    for await (const event of stream as any) {
      if (event?.type === 'content_block_delta' && event?.delta?.type === 'text_delta') {
        const text: string | undefined = event.delta.text;
        if (text) yield text;
      }
    }
  }

  return {
    stream: iterator(),
    finalUsage: async () => {
      try {
        const final = await (stream as any).finalMessage?.();
        const inputTokens = final?.usage?.input_tokens ?? 0;
        const outputTokens = final?.usage?.output_tokens ?? 0;
        return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens };
      } catch {
        return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
      }
    },
    cancel: () => {
      try {
        (stream as any)?.controller?.abort?.();
      } catch {
        /* noop */
      }
    },
  };
}

