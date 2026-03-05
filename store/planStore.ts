/**
 * Plan Store — Athletly V2
 *
 * Zustand store for weekly training plan state.
 * Fetches from Supabase weekly_plans table.
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { WeeklyPlan } from '@/types/plan';

interface PlanState {
  currentPlan: WeeklyPlan | null;
  selectedDate: string;        // ISO date string
  isLoading: boolean;
  error: string | null;

  fetchPlan: (userId: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  refresh: () => Promise<void>;
  clear: () => void;
}

/**
 * Get the current Monday as an ISO date string (YYYY-MM-DD).
 */
function getCurrentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return monday.toISOString().split('T')[0];
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentPlan: null,
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  fetchPlan: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const mondayDate = getCurrentMonday();

      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', userId)
        .gte('week_start', mondayDate)
        .lte('week_start', mondayDate)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (not a real error)
        throw error;
      }

      if (data) {
        const plan: WeeklyPlan = {
          id: data.id,
          userId: data.user_id,
          weekStart: data.week_start,
          weekEnd: data.week_end,
          sessions: data.sessions || [],
          summary: data.summary || undefined,
          coachNote: data.coach_note || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        set({ currentPlan: plan, isLoading: false });
      } else {
        set({ currentPlan: null, isLoading: false });
      }
    } catch (err) {
      console.error('[planStore] Error fetching plan:', err);
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Fehler beim Laden des Plans',
      });
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  refresh: async () => {
    const { currentPlan } = get();
    if (currentPlan?.userId) {
      await get().fetchPlan(currentPlan.userId);
    }
  },

  clear: () => set({ currentPlan: null, error: null }),
}));
