/**
 * HeroWorkoutCard — Athletly V2
 *
 * Hero-sized card showing today's planned workout session.
 * Variants: workout (with sport badge, intensity, CTA) and rest day (moon icon, relaxation).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Moon } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getSportColor } from '@/lib/sport-colors';
import { Colors } from '@/lib/colors';
import type { PlannedSession } from '@/types/plan';

interface HeroWorkoutCardProps {
  session: PlannedSession | null;
  isRestDay: boolean;
  onStart?: () => void;
  onDetails?: () => void;
  onAskCoach?: () => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

const INTENSITY_LABELS: Record<string, string> = {
  easy: 'Leicht',
  moderate: 'Moderat',
  hard: 'Intensiv',
  recovery: 'Regeneration',
};

function RestDayCard({ onAskCoach }: { onAskCoach?: () => void }) {
  return (
    <Card variant="hero" className="mx-4">
      <View
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: getSportColor('rest') }}
      />
      <View className="flex-row items-center gap-2 mb-3 ml-2">
        <Moon size={20} color={getSportColor('rest')} />
        <Text className="text-text-primary text-lg font-semibold">
          Ruhetag
        </Text>
      </View>
      <Text className="text-text-primary text-base font-semibold mb-2 ml-2">
        Aktive Regeneration
      </Text>
      <Text className="text-text-secondary text-sm leading-5 mb-4 ml-2">
        Dein Koerper braucht heute Pause.{'\n'}
        Leichtes Stretching oder Spaziergang empfohlen.
      </Text>
      {onAskCoach && (
        <View className="ml-2">
          <Button
            variant="ghost"
            size="sm"
            label="Trotzdem trainieren?"
            onPress={onAskCoach}
          />
        </View>
      )}
    </Card>
  );
}

function WorkoutCard({
  session,
  onStart,
  onDetails,
  onAskCoach,
}: {
  session: PlannedSession;
  onStart?: () => void;
  onDetails?: () => void;
  onAskCoach?: () => void;
}) {
  const sportColor = getSportColor(session.sport);
  const intensityLabel = INTENSITY_LABELS[session.intensity] ?? session.intensity;

  return (
    <Card variant="hero" className="mx-4">
      {/* Sport-colored top border */}
      <View
        className="absolute top-0 left-4 right-4 h-1 rounded-full"
        style={{ backgroundColor: sportColor }}
      />

      {/* Sport badge + intensity */}
      <View className="flex-row items-center justify-between mt-2 mb-3">
        <Badge type="sport" sport={session.sport} label={session.sport} />
        <Badge type="intensity" intensity={session.intensity} label={intensityLabel} />
      </View>

      {/* Title */}
      <Text className="text-text-primary text-xl font-semibold mb-2">
        {session.title}
      </Text>

      {/* Metrics row */}
      <View className="flex-row gap-4 mb-3">
        {session.duration != null && (
          <Text className="text-text-secondary text-sm">
            {formatDuration(session.duration)}
          </Text>
        )}
        {session.distance != null && (
          <Text className="text-text-secondary text-sm">
            {formatDistance(session.distance)}
          </Text>
        )}
      </View>

      {/* Coach note */}
      {session.coachNote && (
        <View className="bg-surface-elevated rounded-xl p-3 mb-4">
          <Text className="text-text-secondary text-sm italic leading-5">
            {session.coachNote}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View className="gap-2">
        <Button
          variant="primary"
          size="lg"
          label={onStart ? 'Training starten' : 'Details'}
          onPress={onStart ?? onDetails}
        />
        {onAskCoach && (
          <View className="flex-row justify-center">
            <Button
              variant="ghost"
              size="sm"
              label="Coach fragen"
              onPress={onAskCoach}
            />
          </View>
        )}
      </View>
    </Card>
  );
}

export function HeroWorkoutCard({
  session,
  isRestDay,
  onStart,
  onDetails,
  onAskCoach,
}: HeroWorkoutCardProps) {
  if (isRestDay || !session) {
    return <RestDayCard onAskCoach={onAskCoach} />;
  }

  return (
    <WorkoutCard
      session={session}
      onStart={onStart}
      onDetails={onDetails}
      onAskCoach={onAskCoach}
    />
  );
}

export default HeroWorkoutCard;
