/**
 * Onboarding Store — Athletly V2
 *
 * Zustand store for chat-based onboarding flow.
 * Only sessionId is persisted via AsyncStorage.
 * Messages come from the backend on resume.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '@/types/chat';

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

  addMessage: (msg) =>
    set((state) => ({ messages: [msg, ...state.messages] })),

  setSessionId: (id) => {
    set({ sessionId: id });
    AsyncStorage.setItem(SESSION_KEY, id).catch((err) =>
      console.warn('[onboardingStore] Failed to persist sessionId:', err),
    );
  },

  markComplete: () => {
    set({ isComplete: true });
    AsyncStorage.removeItem(SESSION_KEY).catch((err) =>
      console.warn('[onboardingStore] Failed to clear sessionId:', err),
    );
  },

  reset: () => {
    set({ messages: [], sessionId: null, isComplete: false, isSessionLoaded: false });
    AsyncStorage.removeItem(SESSION_KEY).catch((err) =>
      console.warn('[onboardingStore] Failed to clear sessionId:', err),
    );
  },

  loadSession: async () => {
    try {
      const savedId = await AsyncStorage.getItem(SESSION_KEY);
      set({ sessionId: savedId, isSessionLoaded: true });
    } catch (err) {
      console.warn('[onboardingStore] Failed to load sessionId:', err);
      set({ isSessionLoaded: true });
    }
  },
}));
