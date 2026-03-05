/**
 * Health Types — Athletly V2
 *
 * Types for health metrics, trends, and connected services.
 */

export interface HealthMetrics {
  date: string;
  sleepHours?: number;
  sleepScore?: number;
  restingHr?: number;
  hrv?: number;
  steps?: number;
  activeCalories?: number;
  recoveryScore?: number;      // 0-100
  trainingLoad?: number;
}

export interface HealthTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  current: number;
  average7d: number;
  average30d: number;
}

export interface ConnectedService {
  provider: string;            // 'garmin', 'apple_health', 'health_connect'
  connected: boolean;
  lastSync?: string;
}
