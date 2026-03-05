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
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
};

const INTENSITY_COLORS: Record<IntensityLevel, string> = {
  easy: '#34D399',
  moderate: '#3B82F6',
  hard: '#FBBF24',
  max: '#F87171',
  recovery: '#6B7280',
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
