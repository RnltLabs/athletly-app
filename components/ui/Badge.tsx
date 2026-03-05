import React from 'react';
import { View, Text } from 'react-native';
import { getSportColor } from '../../lib/sport-colors';

type BadgeType = 'sport' | 'status' | 'intensity';
type StatusLevel = 'success' | 'warning' | 'error';
type IntensityLevel = 'easy' | 'moderate' | 'hard' | 'max' | 'recovery';

interface BadgeBaseProps {
  label: string;
}

interface SportBadgeProps extends BadgeBaseProps {
  type: 'sport';
  sport: string;
}

interface StatusBadgeProps extends BadgeBaseProps {
  type: 'status';
  status: StatusLevel;
}

interface IntensityBadgeProps extends BadgeBaseProps {
  type: 'intensity';
  intensity: IntensityLevel;
}

type BadgeProps = SportBadgeProps | StatusBadgeProps | IntensityBadgeProps;

const STATUS_COLORS: Record<StatusLevel, string> = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

const INTENSITY_COLORS: Record<IntensityLevel, string> = {
  easy: '#22C55E',
  moderate: '#2563EB',
  hard: '#F59E0B',
  max: '#EF4444',
  recovery: '#94A3B8',
};

function getColorForBadge(props: BadgeProps): string {
  switch (props.type) {
    case 'sport': return getSportColor(props.sport);
    case 'status': return STATUS_COLORS[props.status];
    case 'intensity': return INTENSITY_COLORS[props.intensity];
  }
}

export function Badge(props: BadgeProps) {
  const color = getColorForBadge(props);

  return (
    <View
      className="rounded-full px-3 py-1 self-start"
      style={{ backgroundColor: `${color}15` }}
    >
      <Text
        className="text-xs font-semibold"
        style={{ color }}
      >
        {props.label}
      </Text>
    </View>
  );
}

export default Badge;
