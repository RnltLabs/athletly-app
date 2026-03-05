/**
 * WeeklySummary — Summary card at bottom of plan view
 *
 * Shows sport distribution, total stats, and coach message.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/lib/colors';
import { getSportColor } from '@/lib/sport-colors';
import type { WeeklyPlan } from '@/types/plan';

interface WeeklySummaryProps {
  plan: WeeklyPlan;
}

const SPORT_LABELS: Record<string, string> = {
  running: 'Laufen',
  cycling: 'Radfahren',
  swimming: 'Schwimmen',
  gym: 'Gym',
  strength: 'Kraft',
  yoga: 'Yoga',
  hiking: 'Wandern',
};

function getSportLabel(sport: string): string {
  return SPORT_LABELS[sport.toLowerCase()] ?? sport;
}

function formatTotalDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function buildSportDistribution(plan: WeeklyPlan): Array<{ sport: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const session of plan.sessions) {
    const key = session.sport.toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count);
}

export function WeeklySummary({ plan }: WeeklySummaryProps) {
  const distribution = buildSportDistribution(plan);
  const totalSessions = plan.summary?.totalSessions ?? plan.sessions.length;
  const totalDuration = plan.summary?.totalDuration
    ?? plan.sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);

  return (
    <Card variant="standard" className="mb-4">
      <Text className="text-text-primary text-lg font-semibold mb-3">
        Wochenübersicht
      </Text>

      {/* Sport distribution */}
      <View className="gap-2 mb-3">
        {distribution.map(({ sport, count }) => (
          <View key={sport} className="flex-row items-center gap-2">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getSportColor(sport) }}
            />
            <Text className="text-text-secondary text-sm flex-1">
              {getSportLabel(sport)}
            </Text>
            <Text className="text-text-muted text-sm">
              {count}x
            </Text>
          </View>
        ))}
      </View>

      {/* Total stats */}
      <View className="border-t border-border/30 pt-3 mb-3">
        <Text className="text-text-primary text-sm font-medium">
          {totalSessions} Einheiten · {formatTotalDuration(totalDuration)}
        </Text>
      </View>

      {/* Coach note */}
      {plan.coachNote ? (
        <View className="flex-row items-start gap-2 bg-surface-elevated/50 rounded-lg p-3">
          <MessageCircle size={14} color={Colors.textMuted} strokeWidth={2} />
          <Text className="text-text-secondary text-sm italic flex-1 leading-5">
            {plan.coachNote}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

export default WeeklySummary;
