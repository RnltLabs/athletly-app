/**
 * Onboarding Store — Athletly V2
 *
 * Zustand store for the companion-style onboarding flow.
 * No persistence — data lives in memory only during onboarding.
 * Garmin credentials are never written to AsyncStorage.
 * Call reset() after account creation to clear all state.
 */

import { create } from 'zustand';
import { log } from '@/lib/logger';

const TAG = 'OnboardingStore';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type WearableType = 'garmin' | 'apple_health' | 'health_connect';

interface OnboardingState {
  // Step data
  sports: string[];
  customSport: string | null;
  goals: string[];
  customGoal: string | null;
  availableDays: DayOfWeek[];
  wearable: WearableType | null;
  garminCredentials: { email: string; password: string } | null;

  // Navigation
  currentStep: number;

  // Actions (immutable updates)
  toggleSport: (sport: string) => void;
  setCustomSport: (text: string | null) => void;
  toggleGoal: (goal: string) => void;
  setCustomGoal: (text: string | null) => void;
  toggleDay: (day: DayOfWeek) => void;
  setWearable: (type: WearableType | null) => void;
  setGarminCredentials: (creds: { email: string; password: string } | null) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  sports: [],
  customSport: null,
  goals: [],
  customGoal: null,
  availableDays: [],
  wearable: null,
  garminCredentials: null,
  currentStep: 0,
} as const;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...INITIAL_STATE,

  toggleSport: (sport) => {
    log.debug(TAG, `toggleSport: ${sport}`);
    set((state) => {
      const exists = state.sports.includes(sport);
      return {
        sports: exists
          ? state.sports.filter((s) => s !== sport)
          : [...state.sports, sport],
      };
    });
  },

  setCustomSport: (text) => {
    log.debug(TAG, 'setCustomSport', { text });
    set({ customSport: text });
  },

  toggleGoal: (goal) => {
    log.debug(TAG, `toggleGoal: ${goal}`);
    set((state) => {
      const exists = state.goals.includes(goal);
      return {
        goals: exists
          ? state.goals.filter((g) => g !== goal)
          : [...state.goals, goal],
      };
    });
  },

  setCustomGoal: (text) => {
    log.debug(TAG, 'setCustomGoal', { text });
    set({ customGoal: text });
  },

  toggleDay: (day) => {
    log.debug(TAG, `toggleDay: ${day}`);
    set((state) => {
      const exists = state.availableDays.includes(day);
      return {
        availableDays: exists
          ? state.availableDays.filter((d) => d !== day)
          : [...state.availableDays, day],
      };
    });
  },

  setWearable: (type) => {
    log.debug(TAG, 'setWearable', { type });
    set({ wearable: type });
  },

  setGarminCredentials: (creds) => {
    log.debug(TAG, 'setGarminCredentials', { hasCredentials: creds !== null });
    set({ garminCredentials: creds });
  },

  setStep: (step) => {
    log.debug(TAG, `setStep: ${step}`);
    set({ currentStep: step });
  },

  reset: () => {
    log.info(TAG, 'reset');
    set({ ...INITIAL_STATE });
  },
}));
