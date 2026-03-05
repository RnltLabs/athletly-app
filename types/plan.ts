/**
 * Plan Types — Athletly V2
 *
 * Types for weekly training plans and planned sessions.
 */

export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStart: string;          // ISO date string (Monday)
  weekEnd: string;            // ISO date string (Sunday)
  sessions: PlannedSession[];
  summary?: PlanSummary;
  coachNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannedSession {
  id: string;
  dayOfWeek: number;          // 0=Monday, 6=Sunday
  date: string;               // ISO date string
  sport: string;              // e.g. 'running', 'cycling', 'gym'
  title: string;
  description?: string;
  duration?: number;           // minutes
  distance?: number;           // km
  intensity: 'easy' | 'moderate' | 'hard' | 'recovery';
  coachNote?: string;
  completed?: boolean;
}

export interface PlanSummary {
  totalSessions: number;
  totalDuration: number;       // minutes
  sportDistribution: Record<string, number>; // sport -> count
  weekGoal?: string;
}
