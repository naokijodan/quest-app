// Shared message types between PWA and Agent
export interface AgentRequest {
  id: string;
  type: 'execute';
  payload: {
    cli_tool: 'claude' | 'codex' | 'gemini';
    prompt: string;
    working_directory?: string; // default: sandbox
    allowed_commands?: string[];
    max_execution_time?: number; // seconds, default: 120
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

export type AgentMessage = AgentRequest | AgentPingRequest | AgentCancelRequest;

export interface AgentStreamEvent {
  request_id: string;
  type: 'start' | 'stdout' | 'stderr' | 'progress' | 'complete' | 'error';
}

export interface AgentStartEvent extends AgentStreamEvent {
  type: 'start';
  cli_tool: string;
  pid: number;
}

export interface AgentStdoutEvent extends AgentStreamEvent {
  type: 'stdout';
  content: string;
}

export interface AgentStderrEvent extends AgentStreamEvent {
  type: 'stderr';
  content: string;
}

export interface AgentProgressEvent extends AgentStreamEvent {
  type: 'progress';
  message: string;
}

export interface AgentCompleteEvent extends AgentStreamEvent {
  type: 'complete';
  exit_code: number;
  output: string;
  sandbox_files?: string[];  // NEW: files created in sandbox
}

export interface AgentErrorEvent extends AgentStreamEvent {
  type: 'error';
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
