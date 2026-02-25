'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAgentClient } from '@/lib/agent';
import type { AgentHealthResponse } from '@/lib/agent';

export interface CliInfo {
  name: string;
  command: string;
  installCommand: string;
  description: string;
  available: boolean;
}

export interface UseCliDetectionResult {
  health: AgentHealthResponse | null;
  checking: boolean;
  cliList: CliInfo[];
  hasAnyCli: boolean;
  refreshHealth: () => Promise<void>;
}

export function useCliDetection(): UseCliDetectionResult {
  const [health, setHealth] = useState<AgentHealthResponse | null>(null);
  const [checking, setChecking] = useState(false);

  const client = useMemo(() => getAgentClient(), []);

  const refreshHealth = useCallback(async () => {
    setChecking(true);
    try {
      const h = await client.checkHealth();
      setHealth(h);
    } catch {
      // health check failed silently
    }
    setChecking(false);
  }, [client]);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  const availableTools = health?.available_tools ?? [];
  const hasAnyCli = availableTools.length > 0;

  const cliList: CliInfo[] = [
    {
      name: 'Claude Code',
      command: 'claude',
      installCommand: 'npm install -g @anthropic-ai/claude-code',
      description: 'Anthropicの公式CLI。Claude Proサブスク（月額$20）が必要。',
      available: availableTools.includes('claude'),
    },
    {
      name: 'Codex CLI',
      command: 'codex',
      installCommand: 'npm install -g @openai/codex',
      description: 'OpenAIの公式CLI。ChatGPT Proサブスク（月額$20）が必要。',
      available: availableTools.includes('codex'),
    },
    {
      name: 'Gemini CLI',
      command: 'gemini',
      installCommand: 'npm install -g @anthropic-ai/gemini-cli',
      description: '（まだ利用不可 — 今後対応予定）',
      available: availableTools.includes('gemini'),
    },
  ];

  return { health, checking, cliList, hasAnyCli, refreshHealth };
}
