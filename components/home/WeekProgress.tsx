/**
 * WeekProgress — Athletly V2
 *
 * Shows weekly training progress:
 * "X von Y Einheiten" text + progress bar + day status dots.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getSportColor } from '@/lib/sport-colors';
import { Colors } from '@/lib/colors';
import type { PlannedSession } from '@/types/plan';

interface DayStatus {
  sport: string;
  completed: boolean;
  isRestDay: boolean;
}

interface WeekProgressProps {
  sessions: PlannedSession[];
  totalPlanned: number;
}

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
const DOT_SIZE = 8;

function buildDayStatuses(sessions: PlannedSession[]): DayStatus[] {
  return DAY_LABELS.map((_, index) => {
    const session = sessions.find((s) => s.dayOfWeek === index);
    if (!session) {
      return { sport: 'rest', completed: false, isRestDay: true };
    }
    return {
      sport: session.sport,
      completed: session.completed === true,
      isRestDay: false,
    };
  });
}

export function WeekProgress({ sessions, totalPlanned }: WeekProgressProps) {
  const completedCount = sessions.filter((s) => s.completed).length;
  const progress = totalPlanned > 0 ? completedCount / totalPlanned : 0;
  const dayStatuses = buildDayStatuses(sessions);

  return (
    <View className="mx-4">
      {/* Header */}
      <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
        Wochenfortschritt
      </Text>

      {/* Progress bar */}
      <ProgressBar progress={progress} color={Colors.primary} height={6} />

      {/* Stats text */}
      <Text className="text-text-secondary text-sm mt-2">
        {completedCount} von {totalPlanned} Einheiten
      </Text>

      {/* Day dots */}
      <View className="flex-row justify-between mt-3">
        {DAY_LABELS.map((label, index) => {
          const status = dayStatuses[index];
          const dotColor = status.isRestDay
            ? Colors.surfaceMuted
            : status.completed
              ? getSportColor(status.sport)
              : `${getSportColor(status.sport)}40`;

          return (
            <View key={label} className="items-center gap-1">
              <Text className="text-text-muted text-[10px] font-medium">
                {label}
              </Text>
              <View
                className="rounded-full"
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  backgroundColor: dotColor,
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default WeekProgress;
