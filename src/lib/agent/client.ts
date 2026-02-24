import type {
  AgentCancelRequest,
  AgentConnectionStatus,
  AgentExecuteRequest,
  AgentHealthResponse,
  AgentMessage,
  AgentPongEvent,
  AgentResponse,
} from './types';

export interface AgentClientOptions {
  url?: string; // default: ws://localhost:3939
  token?: string; // auth token
  reconnectInterval?: number; // ms, default: 3000
  maxReconnectAttempts?: number; // default: 10
  healthUrl?: string; // default: http://localhost:3939/health
}

export type AgentEventHandler = (event: AgentResponse) => void;
export type StatusChangeHandler = (status: AgentConnectionStatus) => void;

export class AgentClient {
  private ws: WebSocket | null = null;
  private status: AgentConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly eventHandlers = new Map<string, Set<AgentEventHandler>>();
  private readonly statusHandlers = new Set<StatusChangeHandler>();
  private shouldReconnect = false;

  constructor(private readonly options: AgentClientOptions = {}) {}

  // Connect
  connect(): void {
    // If already connecting or connected, skip
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;
    this.setStatus('connecting');

    const url = this.buildWebSocketUrl();
    try {
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
      };

      ws.onmessage = (evt: MessageEvent) => {
        const data = typeof evt.data === 'string' ? evt.data : '';
        if (data) {
          this.handleMessage(data);
        }
      };

      ws.onerror = () => {
        this.setStatus('error');
      };

      ws.onclose = () => {
        this.ws = null;
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
        }
      };
    } catch (_) {
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  // Disconnect
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const ws = this.ws;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      try {
        ws.close();
      } catch (_) {
        // ignore
      }
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  // Execute command
  execute(options: {
    cli_tool: 'claude' | 'codex' | 'gemini';
    prompt: string;
    working_directory?: string;
    allowed_commands?: string[];
    max_execution_time?: number;
    requires_approval?: boolean;
    onEvent: AgentEventHandler;
  }): { requestId: string; cancel: () => void } {
    const requestId = safeRandomId();

    const msg: AgentExecuteRequest = {
      id: requestId,
      type: 'execute',
      payload: {
        cli_tool: options.cli_tool,
        prompt: options.prompt,
        working_directory: options.working_directory,
        allowed_commands: options.allowed_commands,
        max_execution_time: options.max_execution_time,
        requires_approval: options.requires_approval,
      },
    };

    this.addEventHandler(requestId, options.onEvent);
    this.send(msg);

    const cancel = () => {
      const cancelMsg: AgentCancelRequest = {
        id: safeRandomId(),
        type: 'cancel',
        payload: { request_id: requestId },
      };
      this.send(cancelMsg);
    };

    return { requestId, cancel };
  }

  // Ping → wait for pong
  ping(timeoutMs = 5000): Promise<AgentPongEvent> {
    const reqId = safeRandomId();
    const msg = { id: reqId, type: 'ping' as const };

    return new Promise<AgentPongEvent>((resolve, reject) => {
      let settled = false;

      const handler: AgentEventHandler = (event) => {
        if (event.type === 'pong') {
          settled = true;
          this.removeEventHandler(reqId, handler);
          resolve(event);
        }
      };

      const timer = setTimeout(() => {
        if (!settled) {
          this.removeEventHandler(reqId, handler);
          reject(new Error('Ping timed out'));
        }
      }, timeoutMs);

      this.addEventHandler(reqId, (ev) => {
        handler(ev);
        if (ev.type === 'pong') {
          clearTimeout(timer);
        }
      });

      this.send(msg);
    });
  }

  // HTTP health check
  async checkHealth(): Promise<AgentHealthResponse | null> {
    const url = this.options.healthUrl ?? 'http://localhost:3939/health';
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) return null;
      const data = (await res.json()) as AgentHealthResponse;
      // Shallow validation
      if (data && data.status === 'ok' && Array.isArray(data.available_tools)) {
        return data;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Status getter
  getStatus(): AgentConnectionStatus {
    return this.status;
  }

  // Status change subscription
  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  // Internal utilities
  private send(msg: AgentMessage): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to send message');
    }
  }

  private setStatus(newStatus: AgentConnectionStatus): void {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.statusHandlers.forEach((h) => {
      try {
        h(newStatus);
      } catch (_) {
        // ignore handler errors
      }
    });
  }

  private scheduleReconnect(): void {
    const max = this.options.maxReconnectAttempts ?? 10;
    if (this.reconnectAttempts >= max) {
      this.setStatus('error');
      return;
    }
    const delay = this.options.reconnectInterval ?? 3000;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectAttempts += 1;
    this.setStatus('connecting');
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(data: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch (_) {
      return;
    }

    const event = parsed as AgentResponse;
    // All server events should include request_id except some control messages.
    const requestId = (event as { request_id?: string }).request_id;
    if (!requestId) return;

    const handlers = this.eventHandlers.get(requestId);
    if (!handlers || handlers.size === 0) return;

    handlers.forEach((h) => {
      try {
        h(event);
      } catch (_) {
        // ignore handler errors
      }
    });

    if (event.type === 'complete' || event.type === 'error' || event.type === 'pong') {
      this.eventHandlers.delete(requestId);
    }
  }

  private addEventHandler(requestId: string, handler: AgentEventHandler): void {
    const existing = this.eventHandlers.get(requestId);
    if (existing) {
      existing.add(handler);
    } else {
      this.eventHandlers.set(requestId, new Set([handler]));
    }
  }

  private removeEventHandler(requestId: string, handler: AgentEventHandler): void {
    const existing = this.eventHandlers.get(requestId);
    if (!existing) return;
    existing.delete(handler);
    if (existing.size === 0) {
      this.eventHandlers.delete(requestId);
    }
  }

  private buildWebSocketUrl(): string {
    const base = this.options.url ?? 'ws://localhost:3939';
    const token = this.options.token;
    try {
      const url = new URL(base);
      if (token) {
        url.searchParams.set('token', token);
      }
      return url.toString();
    } catch (_) {
      // Fallback string handling
      if (!token) return base;
      return base.includes('?') ? `${base}&token=${encodeURIComponent(token)}` : `${base}?token=${encodeURIComponent(token)}`;
    }
  }
}

// Singleton instance for the app
let instance: AgentClient | null = null;
export function getAgentClient(options?: AgentClientOptions): AgentClient {
  if (!instance) {
    instance = new AgentClient(options);
  }
  return instance;
}

function safeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID (should not happen in modern browsers)
  return `req_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

