/**
 * Chat Types — Athletly V2
 *
 * Core types for chat messaging, SSE streaming, and checkpoints.
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCalls?: string[];       // tool names used
  checkpointId?: string;      // if this message has a checkpoint
  synced?: boolean;           // whether persisted to backend
}

export interface StreamProgress {
  status: string;
  tool?: string;
  timestamp: string;
}

export interface UsageStats {
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly provider?: string;
  readonly costUsd?: number;
  readonly latencyMs?: number;
}

export type ChatContext = 'coach' | 'onboarding';

export interface Checkpoint {
  id: string;
  type: 'SOFT' | 'HARD';
  preview: Record<string, unknown>;
}

export interface StreamMessage {
  content: string;
  sessionId: string;
}
