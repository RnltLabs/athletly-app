/**
 * Plan Store — Athletly V2
 *
 * Zustand store for weekly training plan state.
 * Fetches from Supabase weekly_plans table.
 *
 * Backend schema:
 *   - days: JSONB array of DayPlan objects
 *   - coach_message: text
 *   - reasoning: text
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { log } from '@/lib/logger';
import type { WeeklyPlan, DayPlan } from '@/types/plan';

const TAG = 'PlanStore';

interface PlanState {
  readonly currentPlan: WeeklyPlan | null;
  readonly selectedDate: string;        // ISO date string
  readonly isLoading: boolean;
  readonly error: string | null;

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

/**
 * Parse the `days` JSONB column from the backend into typed DayPlan[].
 * Defensive: returns empty array if data is missing or malformed.
 */
function parseDays(raw: unknown): readonly DayPlan[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((day) => ({
    date: typeof day.date === 'string' ? day.date : '',
    day_name: typeof day.day_name === 'string' ? day.day_name : '',
    sessions: Array.isArray(day.sessions)
      ? day.sessions.map((s: Record<string, unknown>) => ({
          sport: typeof s.sport === 'string' ? s.sport : 'unknown',
          duration_minutes: typeof s.duration_minutes === 'number' ? s.duration_minutes : 0,
          intensity: typeof s.intensity === 'string' ? s.intensity : 'moderate',
          session_type: typeof s.session_type === 'string' ? s.session_type : '',
          description: typeof s.description === 'string' ? s.description : '',
          details: typeof s.details === 'object' && s.details !== null ? s.details : undefined,
        }))
      : [],
    rest_reason: typeof day.rest_reason === 'string' ? day.rest_reason : undefined,
  }));
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentPlan: null,
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  fetchPlan: async (userId) => {
    set({ isLoading: true, error: null });
    const endTimer = log.time(TAG, 'fetchPlan');

    try {
      const mondayDate = getCurrentMonday();
      log.debug(TAG, 'Fetching plan', { userId: userId.slice(0, 8), weekStart: mondayDate });

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

      endTimer();
      if (data) {
        log.info(TAG, 'Plan loaded', { days: Array.isArray(data.days) ? (data.days as unknown[]).length : 0 });
        const plan: WeeklyPlan = {
          id: data.id,
          userId: data.user_id,
          weekStart: data.week_start,
          days: parseDays(data.days),
          coachMessage: data.coach_message ?? '',
          reasoning: data.reasoning ?? '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        set({ currentPlan: plan, isLoading: false });
      } else {
        log.info(TAG, 'No plan found for this week');
        set({ currentPlan: null, isLoading: false });
      }
    } catch (err) {
      endTimer();
      log.error(TAG, 'Error fetching plan', { error: String(err) });
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
