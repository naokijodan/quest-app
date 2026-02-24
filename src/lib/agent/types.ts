// Agent-related type definitions for the PWA side
// These mirror the Quest Agent interfaces without direct package imports.

// PWA → Agent
export interface AgentExecuteRequest {
  id: string;
  type: 'execute';
  payload: {
    cli_tool: 'claude' | 'codex' | 'gemini';
    prompt: string;
    working_directory?: string;
    allowed_commands?: string[];
    max_execution_time?: number;
    requires_approval?: boolean;
  };
}

export interface AgentPingRequest {
  id: string;
  type: 'ping';
}

export interface AgentCancelRequest {
  id: string;
  type: 'cancel';
  payload: {
    request_id: string;
  };
}

export type AgentMessage = AgentExecuteRequest | AgentPingRequest | AgentCancelRequest;

// Agent → PWA
export type AgentEventType = 'start' | 'stdout' | 'stderr' | 'progress' | 'complete' | 'error' | 'pong';

export interface AgentStartEvent {
  type: 'start';
  request_id: string;
  cli_tool: string;
  pid: number;
}

export interface AgentStdoutEvent {
  type: 'stdout';
  request_id: string;
  content: string;
}

export interface AgentStderrEvent {
  type: 'stderr';
  request_id: string;
  content: string;
}

export interface AgentProgressEvent {
  type: 'progress';
  request_id: string;
  message: string;
}

export interface AgentCompleteEvent {
  type: 'complete';
  request_id: string;
  exit_code: number;
  output: string;
}

export interface AgentErrorEvent {
  type: 'error';
  request_id: string;
  message: string;
  retryable: boolean;
}

export interface AgentPongEvent {
  type: 'pong';
  request_id: string;
  available_tools: string[];
  version: string;
}

export type AgentResponse =
  | AgentStartEvent
  | AgentStdoutEvent
  | AgentStderrEvent
  | AgentProgressEvent
  | AgentCompleteEvent
  | AgentErrorEvent
  | AgentPongEvent;

// Connection state
export type AgentConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface AgentHealthResponse {
  status: 'ok';
  version: string;
  available_tools: string[];
  uptime: number;
}

