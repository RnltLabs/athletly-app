/**
 * Onboarding Store — Athletly V2
 *
 * Zustand store for chat-based onboarding flow.
 * Only sessionId is persisted via AsyncStorage.
 * Messages come from the backend on resume.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '@/lib/logger';
import type { ChatMessage } from '@/types/chat';

const TAG = 'OnboardingStore';

const SESSION_KEY = 'onboarding_session_id';

interface OnboardingState {
  messages: ChatMessage[];
  sessionId: string | null;
  isComplete: boolean;
  isSessionLoaded: boolean;

  addMessage: (msg: ChatMessage) => void;
  setSessionId: (id: string) => void;
  markComplete: () => void;
  reset: () => void;
  loadSession: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  messages: [],
  sessionId: null,
  isComplete: false,
  isSessionLoaded: false,

  addMessage: (msg) => {
    log.debug(TAG, `addMessage: ${msg.role}`, { id: msg.id });
    set((state) => ({ messages: [msg, ...state.messages] }));
  },

  setSessionId: (id) => {
    log.info(TAG, `setSessionId: ${id}`);
    set({ sessionId: id });
    AsyncStorage.setItem(SESSION_KEY, id).catch((err) =>
      log.warn(TAG, 'Failed to persist sessionId', { error: String(err) }),
    );
  },

  markComplete: () => {
    log.info(TAG, 'markComplete');
    set({ isComplete: true });
    AsyncStorage.removeItem(SESSION_KEY).catch((err) =>
      log.warn(TAG, 'Failed to clear sessionId', { error: String(err) }),
    );
  },

  reset: () => {
    log.info(TAG, 'reset');
    set({ messages: [], sessionId: null, isComplete: false, isSessionLoaded: false });
    AsyncStorage.removeItem(SESSION_KEY).catch((err) =>
      log.warn(TAG, 'Failed to clear sessionId', { error: String(err) }),
    );
  },

  loadSession: async () => {
    const endTimer = log.time(TAG, 'loadSession');
    try {
      const savedId = await AsyncStorage.getItem(SESSION_KEY);
      endTimer();
      log.info(TAG, 'Session loaded', { savedId });
      set({ sessionId: savedId, isSessionLoaded: true });
    } catch (err) {
      endTimer();
      log.warn(TAG, 'Failed to load sessionId', { error: String(err) });
      set({ isSessionLoaded: true });
    }
  },
}));
