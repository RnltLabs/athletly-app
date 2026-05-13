/**
 * Plan Store — Athletly V2
 *
 * Zustand store for weekly training plan state.
 * Reads from Supabase `plans` table (plan_data JSONB column).
 *
 * Backend schema (plans table):
 *   - plan_data: JSONB with { sessions, start_date, end_date, focus, name, ... }
 *   - Each session has: day, name, sport, intensity, description, duration_minutes, details
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { log } from '@/lib/logger';
import type { WeeklyPlan, DayPlan, PlannedSession } from '@/types/plan';

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

const GERMAN_DAY_NAMES = [
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag',
  'Freitag', 'Samstag', 'Sonntag',
] as const;

const ENGLISH_DAY_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
] as const;

/**
 * Normalize a day name to German (the app's display language).
 * Handles: "Monday" → "Montag", "Montag" → "Montag", etc.
 */
function normalizeDay(day: string): string {
  const idx = ENGLISH_DAY_NAMES.indexOf(day as typeof ENGLISH_DAY_NAMES[number]);
  if (idx !== -1) return GERMAN_DAY_NAMES[idx];
  return day;
}

/**
 * Format a Date as YYYY-MM-DD using LOCAL time (not UTC).
 * Using toISOString() shifts dates back by 1 day in CET/CEST timezones.
 */
function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get the Monday of the week containing the given ISO date.
 */
function getMondayOfWeek(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return toLocalISO(new Date(d.getFullYear(), d.getMonth(), diff));
}

/**
 * Get the current Monday as an ISO date string (YYYY-MM-DD).
 */
function getCurrentMonday(): string {
  return getMondayOfWeek(toLocalISO(new Date()));
}

/**
 * Add N days to an ISO date string.
 */
function addDays(dateISO: string, n: number): string {
  const d = new Date(dateISO + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return toLocalISO(d);
}

/**
 * Transform a flat sessions array from the agent into day-grouped DayPlan[].
 *
 * Agent format:
 *   { day: "Montag", name: "Easy Run", sport: "running", intensity: "easy", ... }
 *
 * App format:
 *   { date: "2026-03-16", day_name: "Montag", sessions: [{ sport, ... }] }
 */
function transformSessionsToDays(
  sessions: readonly Record<string, unknown>[],
  startDate: string,
): readonly DayPlan[] {
  const weekStart = getMondayOfWeek(startDate);

  // Group sessions by day name (normalize English → German)
  const byDay = new Map<string, Record<string, unknown>[]>();
  for (const session of sessions) {
    const rawDay = typeof session.day === 'string' ? session.day : '';
    const dayName = normalizeDay(rawDay);
    const existing = byDay.get(dayName) ?? [];
    byDay.set(dayName, [...existing, session]);
  }

  // Build all 7 days of the week
  return GERMAN_DAY_NAMES.map((dayName, index): DayPlan => {
    const date = addDays(weekStart, index);
    const daySessions = byDay.get(dayName) ?? [];

    const isRestDay = daySessions.length === 0 ||
      (daySessions.length === 1 && daySessions[0].sport === 'rest');

    if (isRestDay) {
      const restSession = daySessions[0];
      return {
        date,
        day_name: dayName,
        sessions: [],
        rest_reason: typeof restSession?.description === 'string'
          ? restSession.description
          : 'Ruhetag',
      };
    }

    const mapped: PlannedSession[] = daySessions.map((s) => ({
      sport: typeof s.sport === 'string' ? s.sport : 'unknown',
      duration_minutes: typeof s.duration_minutes === 'number'
        ? s.duration_minutes
        : typeof s.total_duration_minutes === 'number'
          ? s.total_duration_minutes
          : 0,
      intensity: typeof s.intensity === 'string' ? s.intensity as PlannedSession['intensity'] : 'moderate',
      session_type: typeof s.name === 'string'
        ? s.name
        : typeof s.type === 'string'
          ? s.type
          : '',
      description: typeof s.description === 'string' ? s.description : '',
      details: typeof s.details === 'string'
        ? { notes: s.details }
        : typeof s.details === 'object' && s.details !== null
          ? s.details as PlannedSession['details']
          : typeof s.pace_zones === 'object' && s.pace_zones !== null
            ? s.pace_zones as PlannedSession['details']
            : Array.isArray(s.steps) && s.steps.length > 0
              ? { steps: s.steps } as PlannedSession['details']
              : undefined,
    }));

    return { date, day_name: dayName, sessions: mapped };
  });
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentPlan: null,
  selectedDate: toLocalISO(new Date()),
  isLoading: false,
  error: null,

  fetchPlan: async (userId) => {
    set({ isLoading: true, error: null });
    const endTimer = log.time(TAG, 'fetchPlan');

    try {
      const mondayDate = getCurrentMonday();
      log.debug(TAG, 'Fetching plan', { userId: userId.slice(0, 8), weekStart: mondayDate });

      // Fetch the most recent plan whose start_date falls within the current week.
      // plan_data->start_date is stored as ISO string within the JSONB.
      const { data, error } = await supabase
        .from('plans')
        .select('id, user_id, created_at, plan_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      endTimer();

      if (data) {
        const planData = data.plan_data as Record<string, unknown> ?? {};
        const sessions = Array.isArray(planData.sessions) ? planData.sessions : [];
        const startDate = typeof planData.start_date === 'string'
          ? planData.start_date
          : typeof planData.week_start === 'string'
            ? planData.week_start
            : mondayDate;

        const planWeekStart = getMondayOfWeek(startDate);

        log.info(TAG, 'Plan loaded', {
          sessions: sessions.length,
          startDate,
          planWeekStart,
        });

        const days = transformSessionsToDays(sessions, startDate);
        const focus = typeof planData.focus === 'string'
          ? planData.focus
          : typeof planData.weekly_summary === 'string'
            ? planData.weekly_summary
            : '';

        const plan: WeeklyPlan = {
          id: data.id,
          userId: data.user_id,
          weekStart: planWeekStart,
          days,
          coachMessage: focus,
          reasoning: '',
          createdAt: data.created_at,
          updatedAt: data.created_at,
        };
        set({ currentPlan: plan, isLoading: false });
      } else {
        log.info(TAG, 'No plan found');
        set({ currentPlan: null, isLoading: false });
      }
    } catch (err) {
      endTimer();
      const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
      log.error(TAG, 'Error fetching plan', { error: errMsg });
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
