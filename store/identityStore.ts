/**
 * Identity Store - Athletly V2
 *
 * Zustand store backing the "Wie Athletly dich sieht" settings screen.
 * Fetches `/profile/identity` from the backend which returns canonical
 * sections (identity, goal, training, ...) plus a structured profile
 * block. The screen renders this read-only; edits flow through the chat.
 */

import { create } from 'zustand';
import { apiGet } from '@/lib/api';
import { log } from '@/lib/logger';
import type { IdentityResponse } from '@/types/identity';

const TAG = 'IdentityStore';

interface IdentityState {
  readonly currentIdentity: IdentityResponse | null;
  readonly isLoading: boolean;
  readonly error: string | null;

  fetchIdentity: (userId: string) => Promise<void>;
  clear: () => void;
}

export const useIdentityStore = create<IdentityState>((set) => ({
  currentIdentity: null,
  isLoading: false,
  error: null,

  fetchIdentity: async (userId: string) => {
    set({ isLoading: true, error: null });
    const endTimer = log.time(TAG, 'fetchIdentity');
    try {
      log.debug(TAG, 'Fetching identity', { userId: userId.slice(0, 8) });
      const data = await apiGet<IdentityResponse>('/profile/identity');
      endTimer();
      log.info(TAG, 'Identity loaded', {
        sections: data.sections.length,
        hasName: data.athlete_name !== null,
      });
      set({ currentIdentity: data, isLoading: false, error: null });
    } catch (err) {
      endTimer();
      const message = err instanceof Error ? err.message : 'Fehler beim Laden';
      log.error(TAG, 'fetchIdentity failed', { error: message });
      set({ isLoading: false, error: message });
    }
  },

  clear: () => set({ currentIdentity: null, error: null, isLoading: false }),
}));
