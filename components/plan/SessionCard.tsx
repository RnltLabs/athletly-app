/**
 * SessionCard — Workout session details card
 *
 * Shows sport badge, intensity, title, description,
 * metrics (duration/distance), coach note, and action buttons.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Clock, MapPin, MessageCircle } from 'lucide-react-native';
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
  easy: 'Leicht',
  moderate: 'Moderat',
  hard: 'Intensiv',
  recovery: 'Erholung',
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDistance(km: number): string {
  return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`;
}

export function SessionCard({ session, onStart, onDetails }: SessionCardProps) {
  const sportColor = getSportColor(session.sport);
  const intensityLabel = INTENSITY_LABELS[session.intensity] ?? session.intensity;

  return (
    <Card variant="standard" className="mb-3">
      {/* Top accent bar */}
      <View className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: sportColor }} />

      {/* Badges row */}
      <View className="flex-row items-center justify-between mt-1 mb-2">
        <Badge type="sport" sport={session.sport} label={session.sport} />
        <Badge type="intensity" intensity={session.intensity} label={intensityLabel} />
      </View>

      {/* Title */}
      <Text className="text-text-primary text-lg font-semibold mb-1">
        {session.title}
      </Text>

      {/* Description */}
      {session.description ? (
        <Text className="text-text-secondary text-sm mb-3 leading-5">
          {session.description}
        </Text>
      ) : null}

      {/* Metrics row */}
      <View className="flex-row items-center gap-4 mb-3">
        {session.duration != null && (
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color={Colors.textSecondary} strokeWidth={2} />
            <Text className="text-text-secondary text-sm">
              {formatDuration(session.duration)}
            </Text>
          </View>
        )}
        {session.distance != null && (
          <View className="flex-row items-center gap-1.5">
            <MapPin size={14} color={Colors.textSecondary} strokeWidth={2} />
            <Text className="text-text-secondary text-sm">
              {formatDistance(session.distance)}
            </Text>
          </View>
        )}
      </View>

      {/* Coach note */}
      {session.coachNote ? (
        <View className="flex-row items-start gap-2 rounded-lg p-3 mb-3" style={{ backgroundColor: '#F5F6F8' }}>
          <MessageCircle size={14} color={Colors.textMuted} strokeWidth={2} />
          <Text className="text-text-secondary text-sm italic flex-1 leading-5">
            {session.coachNote}
          </Text>
        </View>
      ) : null}

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
