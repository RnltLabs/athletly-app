/**
 * parseVoice — Public API helper for the onboarding voice-parsing endpoint.
 *
 * POST /api/onboarding/parse-voice
 * Auth: None (public, rate-limited at 10 req/IP/hour on the backend).
 *
 * Returns extracted items for the "sport" step, or items + optional
 * structured data for the "goals" step.
 */

import { API_URL } from '@/lib/api';
import { log } from '@/lib/logger';

const TAG = 'parseVoice';

export type ParseVoiceStep = 'sport' | 'goals';

export interface ParseVoiceResponse {
  items: string[];
  structured?: {
    event?: string;
    location?: string;
    date?: string;
    target_time?: string;
  };
}

export async function parseVoice(
  text: string,
  step: ParseVoiceStep,
): Promise<ParseVoiceResponse> {
  log.debug(TAG, 'Sending parse-voice request', { step, textLength: text.length });

  const response = await fetch(`${API_URL}/api/onboarding/parse-voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, step }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '<unreadable>');
    log.error(TAG, `parse-voice failed: ${response.status}`, { body: body.slice(0, 300) });
    throw new Error(`parse-voice error: ${response.status}`);
  }

  const data: ParseVoiceResponse = await response.json();
  log.debug(TAG, 'parse-voice response', { step, itemCount: data.items.length });
  return data;
}
