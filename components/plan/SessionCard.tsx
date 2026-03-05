/**
 * SessionCard — Workout session details card with glassmorphism effect
 *
 * Shows sport badge, intensity, session type, description,
 * duration metric, and optional details expansion.
 * Uses a frosted-glass background with BlurView on iOS,
 * with a semi-transparent white fallback on Android.
 */

import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Clock, HelpCircle, ThumbsDown, Calendar } from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/colors';
import { getSportColor } from '@/lib/sport-colors';
import type { PlannedSession } from '@/types/plan';

interface SessionCardProps {
  session: PlannedSession;
  onStart?: () => void;
  onDetails?: () => void;
  onQuickAction?: (action: string, message: string) => void;
}

const QUICK_ACTIONS = [
  { key: 'why', label: 'Warum?', message: 'Warum habe ich heute dieses Training im Plan?', icon: HelpCircle },
  { key: 'too_hard', label: 'Zu hart', message: 'Das Training heute ist mir zu hart. Kannst du es anpassen?', icon: ThumbsDown },
  { key: 'reschedule', label: 'Verschieben', message: 'Kann ich das Training heute verschieben?', icon: Calendar },
] as const;

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

const GLASS_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...GLASS_SHADOW,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurView: {
    padding: 16,
  },
  fallbackBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 16,
    borderRadius: 16,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

function GlassBackground({ children }: { readonly children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.blurContainer}>
        <BlurView intensity={40} tint="light" style={styles.blurView}>
          {children}
        </BlurView>
      </View>
    );
  }

  // Android fallback: semi-transparent white
  return (
    <View style={styles.fallbackBg}>
      {children}
    </View>
  );
}

export function SessionCard({ session, onStart, onDetails, onQuickAction }: SessionCardProps) {
  const sportColor = getSportColor(session.sport);
  const intensityLabel = INTENSITY_LABELS[session.intensity] ?? DEFAULT_INTENSITY_LABEL;
  const typeLabel = getSessionTypeLabel(session.session_type);

  return (
    <View style={styles.cardOuter}>
      <GlassBackground>
        {/* Top accent bar */}
        <View style={[styles.accentBar, { backgroundColor: sportColor }]} />

        {/* Badges row */}
        <View className="flex-row items-center justify-between mt-1 mb-2">
          <View className="flex-row items-center gap-2">
            <Badge type="sport" sport={session.sport} label={session.sport} />
            {session.session_type ? (
              <Text className="text-xs font-medium" style={{ color: Colors.textMuted }}>
                {typeLabel}
              </Text>
            ) : null}
          </View>
          <Badge type="intensity" intensity={session.intensity} label={intensityLabel} />
        </View>

        {/* Description */}
        {session.description ? (
          <Text className="text-sm mb-3 leading-5" style={{ color: Colors.textSecondary }}>
            {session.description}
          </Text>
        ) : null}

        {/* Metrics row */}
        <View className="flex-row items-center gap-4 mb-3">
          {session.duration_minutes > 0 && (
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color={Colors.textSecondary} strokeWidth={2} />
              <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                {formatDuration(session.duration_minutes)}
              </Text>
            </View>
          )}
        </View>

        {/* Quick action buttons */}
        {onQuickAction && (
          <View className="flex-row items-center gap-2 mb-3">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.key}
                variant="ghost"
                size="sm"
                label={action.label}
                icon={action.icon}
                onPress={() => onQuickAction(action.key, action.message)}
              />
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row items-center justify-end gap-2">
          {onDetails && (
            <Button variant="ghost" size="sm" label="Details" onPress={onDetails} />
          )}
          {onStart && (
            <Button variant="primary" size="sm" label="Starten" onPress={onStart} />
          )}
        </View>
      </GlassBackground>
    </View>
  );
}

export default SessionCard;
