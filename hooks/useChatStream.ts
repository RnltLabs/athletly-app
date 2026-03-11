/**
 * Chat Stream Hook — Athletly V2
 *
 * Streams chat responses from the Python backend via SSE.
 *
 * Event protocol (Python backend):
 *   session_start  -> {session_id}
 *   thinking       -> {text}
 *   tool_hint      -> {name, args}
 *   tool_result    -> {name, preview}
 *   tool_error     -> {detail}
 *   message        -> {text, checkpoint?: {id, type, preview}}
 *   usage          -> {input_tokens, output_tokens, model}
 *   onboarding_complete -> {}
 *   error          -> {message, code}
 *   done           -> {}
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import type {
  StreamProgress,
  StreamMessage,
  UsageStats,
  ChatContext,
  Checkpoint,
} from '@/types/chat';

import EventSource from 'react-native-sse';
import { setStreamActive } from '@/lib/chatActiveFlag';

/**
 * Custom SSE event types from the Python backend.
 */
type SSEEvents =
  | 'session_start'
  | 'thinking'
  | 'tool_hint'
  | 'tool_result'
  | 'tool_error'
  | 'usage'
  | 'onboarding_complete'
  | 'done';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://athletly.rnltlabs.de';

interface UseChatStreamResult {
  sendMessage: (
    message: string,
    sessionId: string,
    onMessage: (message: StreamMessage) => void,
    onProgress?: (progress: StreamProgress) => void,
    context?: ChatContext,
    onOnboardingComplete?: () => void,
    onCheckpoint?: (checkpoint: Checkpoint) => void,
  ) => Promise<void>;
  isStreaming: boolean;
  progress: StreamProgress | null;
  toolsUsed: string[];
  usage: UsageStats | null;
  error: string | null;
  abort: () => void;
}

export function useChatStream(): UseChatStreamResult {
  const session = useAuthStore((state) => state.session);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<StreamProgress | null>(null);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const abort = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
      setStreamActive(false);
      setProgress(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const sendMessage = useCallback(
    async (
      message: string,
      sessionId: string,
      onMessage: (message: StreamMessage) => void,
      onProgress?: (progress: StreamProgress) => void,
      context?: ChatContext,
      onOnboardingComplete?: () => void,
      onCheckpoint?: (checkpoint: Checkpoint) => void,
    ) => {
      if (!session?.access_token) {
        setError('Nicht authentifiziert');
        throw new Error('Not authenticated');
      }

      // Abort any existing stream
      abort();

      setIsStreaming(true);
      setStreamActive(true);
      setProgress(null);
      setToolsUsed([]);
      setUsage(null);
      setError(null);

      const url = `${API_URL}/chat`;

      // Track session_id from the server (emitted via session_start event)
      let capturedSessionId = sessionId;

      return new Promise<void>((resolve, reject) => {
        try {
          const es = new EventSource<SSEEvents>(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message,
              session_id: sessionId,
              ...(context && { context }),
            }),
            pollingInterval: 0,
          });

          eventSourceRef.current = es;

          es.addEventListener('open', () => {
            console.log('[useChatStream] Connection opened');
          });

          es.addEventListener('session_start', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              capturedSessionId = data.session_id;
              console.log('[useChatStream] Session:', capturedSessionId);
            } catch (e) {
              console.warn('[useChatStream] Failed to parse session_start:', e);
            }
          });

          es.addEventListener('thinking', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              const prog: StreamProgress = {
                status: data.text || 'Denke nach...',
                timestamp: new Date().toISOString(),
              };
              setProgress(prog);
              onProgress?.(prog);
            } catch (e) {
              console.warn('[useChatStream] Failed to parse thinking:', e);
            }
          });

          es.addEventListener('tool_hint', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              const prog: StreamProgress = {
                status: 'Using tool...',
                tool: data.name,
                timestamp: new Date().toISOString(),
              };
              setProgress(prog);
              onProgress?.(prog);
            } catch (e) {
              console.warn('[useChatStream] Failed to parse tool_hint:', e);
            }
          });

          es.addEventListener('tool_result', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              setToolsUsed((prev) => [...prev, data.name]);
            } catch (e) {
              console.warn('[useChatStream] Failed to parse tool_result:', e);
            }
          });

          es.addEventListener('tool_error', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              const prog: StreamProgress = {
                status: `Tool error: ${data.detail || 'unknown'}`,
                timestamp: new Date().toISOString(),
              };
              setProgress(prog);
              onProgress?.(prog);
            } catch (e) {
              console.warn('[useChatStream] Failed to parse tool_error:', e);
            }
          });

          es.addEventListener('message', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              onMessage({
                content: data.text,
                sessionId: capturedSessionId,
              });

              // Extract checkpoint if present in the message event
              if (data.checkpoint && typeof data.checkpoint === 'object') {
                const cp: Checkpoint = {
                  id: data.checkpoint.id,
                  type: data.checkpoint.type === 'SOFT' ? 'SOFT' : 'HARD',
                  preview: data.checkpoint.preview ?? {},
                };
                console.log('[useChatStream] Checkpoint received:', cp.id, cp.type);
                onCheckpoint?.(cp);
              }
            } catch (e) {
              console.warn('[useChatStream] Failed to parse message:', e);
            }
          });

          es.addEventListener('usage', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              setUsage({
                model: data.model,
                inputTokens: data.input_tokens,
                outputTokens: data.output_tokens,
                provider: typeof data.provider === 'string' ? data.provider : undefined,
                costUsd: typeof data.cost_usd === 'number' ? data.cost_usd : undefined,
                latencyMs: typeof data.latency_ms === 'number' ? data.latency_ms : undefined,
              });
            } catch (e) {
              console.warn('[useChatStream] Failed to parse usage:', e);
            }
          });

          es.addEventListener('onboarding_complete', (event: any) => {
            try {
              const data = JSON.parse(event.data);
              console.log('[useChatStream] Onboarding complete:', data);
            } catch (e) {
              console.warn('[useChatStream] Failed to parse onboarding_complete:', e);
            }
            onOnboardingComplete?.();
          });

          es.addEventListener('error', (event: any) => {
            // When the app is backgrounded on iOS, the OS kills the SSE
            // connection. xhrStatus 200 + "connection was lost" means the
            // request was successful but the socket was dropped — treat
            // this as a graceful end, not an error.
            const isBackgroundDisconnect =
              event.xhrStatus === 200 &&
              typeof event.message === 'string' &&
              event.message.toLowerCase().includes('connection was lost');

            if (isBackgroundDisconnect) {
              console.log('[useChatStream] Connection lost (app backgrounded) — closing gracefully');
              es.close();
              setIsStreaming(false);
              setStreamActive(false);
              setProgress(null);
              eventSourceRef.current = null;
              resolve();
              return;
            }

            console.error('[useChatStream] SSE Error:', event);

            if (event.data) {
              try {
                const data = JSON.parse(event.data);
                setError(data.message || 'Stream-Fehler');
              } catch {
                setError('Verbindungsfehler');
              }
            } else {
              setError(event.message || 'Verbindungsfehler');
            }

            es.close();
            setIsStreaming(false);
            setStreamActive(false);
            setProgress(null);
            eventSourceRef.current = null;
            reject(new Error('Stream error'));
          });

          es.addEventListener('done', () => {
            console.log('[useChatStream] Stream complete');
            es.close();
            setIsStreaming(false);
            setStreamActive(false);
            setProgress(null);
            eventSourceRef.current = null;
            resolve();
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
          setError(errorMessage);
          setIsStreaming(false);
          setProgress(null);
          console.error('[useChatStream] Error:', err);
          reject(err);
        }
      });
    },
    [session, abort],
  );

  return {
    sendMessage,
    isStreaming,
    progress,
    toolsUsed,
    usage,
    error,
    abort,
  };
}
