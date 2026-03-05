/**
 * WeekStrip — 7-day horizontal selector (Mo-So)
 *
 * Shows day abbreviation, date number, sport indicator dots,
 * today highlight, and selected state.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Moon } from 'lucide-react-native';
import { getSportColor } from '@/lib/sport-colors';
import { Colors } from '@/lib/colors';
import type { PlannedSession } from '@/types/plan';

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

interface WeekStripProps {
  weekStart: string;
  sessions: PlannedSession[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function getDateForDay(weekStart: string, dayIndex: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().split('T')[0];
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getSessionsForDate(sessions: PlannedSession[], date: string): PlannedSession[] {
  return sessions.filter((s) => s.date === date);
}

export function WeekStrip({ weekStart, sessions, selectedDate, onSelectDate }: WeekStripProps) {
  const today = getTodayISO();

  return (
    <View className="flex-row justify-between px-2 py-2">
      {DAY_LABELS.map((label, index) => {
        const date = getDateForDay(weekStart, index);
        const dayNumber = new Date(date).getDate();
        const isToday = date === today;
        const isSelected = date === selectedDate;
        const daySessions = getSessionsForDate(sessions, date);
        const isRest = daySessions.length === 0;

        return (
          <Pressable
            key={date}
            onPress={() => onSelectDate(date)}
            className={`items-center py-2 px-2 rounded-xl flex-1 mx-0.5 ${
              isSelected ? 'border-b-2' : ''
            }`}
            style={[
              isSelected ? { backgroundColor: `${Colors.primary}20`, borderBottomColor: Colors.primary } : undefined,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${dayNumber}`}
          >
            <Text
              className="text-xs font-medium mb-1"
              style={{ color: isToday ? Colors.primary : Colors.textSecondary }}
            >
              {label}
            </Text>

            <Text
              className="text-sm font-semibold mb-1.5"
              style={{ color: isSelected ? Colors.primary : Colors.textPrimary }}
            >
              {dayNumber}
            </Text>

            {/* Sport indicator dots */}
            <View className="flex-row items-center gap-0.5 h-3">
              {isRest ? (
                <Moon size={10} color={Colors.textMuted} strokeWidth={2} />
              ) : (
                daySessions.map((session) => (
                  <View
                    key={session.id}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getSportColor(session.sport) }}
                  />
                ))
              )}
            </View>

            {isToday && (
              <Text className="text-[9px] font-medium mt-0.5" style={{ color: Colors.primary }}>
                Heute
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default WeekStrip;
