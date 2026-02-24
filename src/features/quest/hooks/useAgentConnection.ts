"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAgentClient } from '@/lib/agent';
import type { AgentConnectionStatus, AgentHealthResponse } from '@/lib/agent';

interface UseAgentConnectionReturn {
  status: AgentConnectionStatus;
  availableTools: string[];
  agentVersion: string | null;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

export function useAgentConnection(options?: {
  autoConnect?: boolean; // default true
  token?: string;
}): UseAgentConnectionReturn {
  const { autoConnect = true, token } = options ?? {};

  // 1. getAgentClient() でシングルトン取得（初回のみ token を反映）
  const client = useMemo(() => getAgentClient(token ? { token } : undefined), [token]);

  const [status, setStatus] = useState<AgentConnectionStatus>(client.getStatus());
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [agentVersion, setAgentVersion] = useState<string | null>(null);

  // 3. onStatusChange でステータスを同期
  useEffect(() => {
    const unsubscribe = client.onStatusChange((s) => {
      setStatus(s);
      if (s !== 'connected') {
        setAvailableTools([]);
        setAgentVersion(null);
      }
    });
    return unsubscribe;
  }, [client]);

  // 2. autoConnect: 初回に health チェックし、起動していれば connect()
  useEffect(() => {
    let mounted = true;
    if (!autoConnect) return () => { mounted = false; };

    (async () => {
      const health: AgentHealthResponse | null = await client.checkHealth();
      if (!mounted) return;
      if (health) {
        // Agent は起動中。接続を開始。
        client.connect();
      } else {
        // 起動していなければそのまま。
        setStatus('disconnected');
      }
    })();

    // 5. クリーンアップで disconnect
    return () => {
      mounted = false;
      client.disconnect();
    };
  }, [autoConnect, client]);

  // 4. connect 時に ping() で利用可能ツール/バージョン取得
  useEffect(() => {
    let cancelled = false;
    if (status !== 'connected') return () => { cancelled = true; };
    (async () => {
      try {
        const pong = await client.ping(4000);
        if (cancelled) return;
        setAvailableTools(Array.isArray(pong.available_tools) ? pong.available_tools : []);
        setAgentVersion(pong.version ?? null);
      } catch (_) {
        if (cancelled) return;
        setAvailableTools([]);
        setAgentVersion(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, status]);

  const connect = useCallback(() => {
    client.connect();
  }, [client]);

  const disconnect = useCallback(() => {
    client.disconnect();
  }, [client]);

  // 6. isConnected = status === 'connected'
  const isConnected = status === 'connected';

  return { status, availableTools, agentVersion, connect, disconnect, isConnected };
}

