/**
 * SessionCard — Workout session details card
 *
 * Shows sport badge, intensity, session type, description,
 * duration metric, and optional details expansion.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/colors';
import { getSportColor } from '@/lib/sport-colors';
import type { PlannedSession } from '@/types/plan';

interface SessionCardProps {
  session: PlannedSession;
  onStart?: () => void;
  onDetails?: () => void;
}

const INTENSITY_LABELS: Record<string, string> = {
  low: 'Leicht',
  moderate: 'Moderat',
  high: 'Intensiv',
};

const DEFAULT_INTENSITY_LABEL = 'Unbekannt';

const SESSION_TYPE_LABELS: Record<string, string> = {
  intervals: 'Intervalle',
  tempo: 'Tempo',
  long_run: 'Langer Lauf',
  easy_run: 'Lockerer Lauf',
  recovery: 'Erholung',
  strength: 'Kraft',
  flexibility: 'Beweglichkeit',
  endurance: 'Ausdauer',
  race: 'Wettkampf',
};

function getSessionTypeLabel(sessionType: string): string {
  return SESSION_TYPE_LABELS[sessionType] ?? sessionType;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function SessionCard({ session, onStart, onDetails }: SessionCardProps) {
  const sportColor = getSportColor(session.sport);
  const intensityLabel = INTENSITY_LABELS[session.intensity] ?? DEFAULT_INTENSITY_LABEL;
  const typeLabel = getSessionTypeLabel(session.session_type);

  return (
    <Card variant="standard" className="mb-3">
      {/* Top accent bar */}
      <View className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: sportColor }} />

      {/* Badges row */}
      <View className="flex-row items-center justify-between mt-1 mb-2">
        <View className="flex-row items-center gap-2">
          <Badge type="sport" sport={session.sport} label={session.sport} />
          {session.session_type ? (
            <Text className="text-text-muted text-xs font-medium">
              {typeLabel}
            </Text>
          ) : null}
        </View>
        <Badge type="intensity" intensity={session.intensity} label={intensityLabel} />
      </View>

      {/* Description */}
      {session.description ? (
        <Text className="text-text-secondary text-sm mb-3 leading-5">
          {session.description}
        </Text>
      ) : null}

      {/* Metrics row */}
      <View className="flex-row items-center gap-4 mb-3">
        {session.duration_minutes > 0 && (
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color={Colors.textSecondary} strokeWidth={2} />
            <Text className="text-text-secondary text-sm">
              {formatDuration(session.duration_minutes)}
            </Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center justify-end gap-2">
        {onDetails && (
          <Button variant="ghost" size="sm" label="Details" onPress={onDetails} />
        )}
        {onStart && (
          <Button variant="primary" size="sm" label="Starten" onPress={onStart} />
        )}
      </View>
    </Card>
  );
}

export default SessionCard;
