/**
 * Health Store — Athletly V2
 *
 * Zustand store for health metrics, trends, and connected services.
 * Fetches from Supabase daily_metrics and provider_tokens tables.
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { HealthMetrics, HealthTrend, ConnectedService } from '@/types/health';

interface HealthState {
  metrics: HealthMetrics | null;
  trends: HealthTrend[];
  connectedServices: ConnectedService[];
  isLoading: boolean;

  fetchMetrics: (userId: string) => Promise<void>;
  fetchConnectedServices: (userId: string) => Promise<void>;
  clear: () => void;
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export const useHealthStore = create<HealthState>((set) => ({
  metrics: null,
  trends: [],
  connectedServices: [],
  isLoading: false,

  fetchMetrics: async (userId) => {
    set({ isLoading: true });

    try {
      const today = getToday();

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('[healthStore] Error fetching metrics:', error.message);
        set({ isLoading: false });
        return;
      }

      if (data) {
        const metrics: HealthMetrics = {
          date: data.date,
          sleepHours: data.sleep_hours ?? undefined,
          sleepScore: data.sleep_score ?? undefined,
          restingHr: data.resting_hr ?? undefined,
          hrv: data.hrv ?? undefined,
          steps: data.steps ?? undefined,
          activeCalories: data.active_calories ?? undefined,
          recoveryScore: data.recovery_score ?? undefined,
          trainingLoad: data.training_load ?? undefined,
        };
        set({ metrics, isLoading: false });
      } else {
        set({ metrics: null, isLoading: false });
      }
    } catch (err) {
      console.error('[healthStore] Failed to fetch metrics:', err);
      set({ isLoading: false });
    }
  },

  fetchConnectedServices: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('provider_tokens')
        .select('provider, updated_at')
        .eq('user_id', userId);

      if (error) {
        console.error('[healthStore] Error fetching connected services:', error.message);
        return;
      }

      const services: ConnectedService[] = (data || []).map((row) => ({
        provider: row.provider,
        connected: true,
        lastSync: row.updated_at || undefined,
      }));

      set({ connectedServices: services });
    } catch (err) {
      console.error('[healthStore] Failed to fetch connected services:', err);
    }
  },

  clear: () => set({ metrics: null, trends: [], connectedServices: [] }),
}));
