/**
 * Auth Store — Athletly V2
 *
 * Zustand store for authentication state.
 * Listens to Supabase onAuthStateChange and checks onboarding status.
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session, Subscription } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isOnboarded: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Subscription | undefined;
  setOnboarded: (value: boolean) => void;
  reset: () => void;
}

/**
 * Check if user has completed onboarding by querying user_models table.
 * If a row exists for this user, they are onboarded.
 */
async function checkOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_models')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[authStore] Error checking onboarding status:', error.message);
      return false;
    }

    return data !== null;
  } catch (err) {
    console.warn('[authStore] Failed to check onboarding:', err);
    return false;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isOnboarded: false,
  isLoading: true,
  isInitialized: false,

  initialize: () => {
    set({ isLoading: true });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const onboarded = await checkOnboardingStatus(session.user.id);
        set({
          user: session.user,
          session,
          isOnboarded: onboarded,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          session: null,
          isOnboarded: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const onboarded = await checkOnboardingStatus(session.user.id);
          set({
            user: session.user,
            session,
            isOnboarded: onboarded,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            session: null,
            isOnboarded: false,
            isLoading: false,
          });
        }
      }
    );

    return subscription;
  },

  setOnboarded: (value) => set({ isOnboarded: value }),

  reset: () =>
    set({
      user: null,
      session: null,
      isOnboarded: false,
      isLoading: false,
    }),
}));
