/**
 * RestDayCard — Card displayed for rest/recovery days
 *
 * Shows a calming moon icon with a recovery message.
 * Uses the nested card variant for a subtle, muted appearance.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Moon } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/lib/colors';

interface RestDayCardProps {
  message?: string;
}

export function RestDayCard({ message }: RestDayCardProps) {
  return (
    <Card variant="nested" className="mb-3 items-center py-8">
      <Moon size={40} color={Colors.textMuted} strokeWidth={1.5} />

      <Text className="text-text-primary text-lg font-semibold mt-4">
        Ruhetag
      </Text>

      <Text className="text-text-secondary text-sm text-center mt-2 px-4 leading-5">
        {message ?? 'Erholung ist genauso wichtig wie das Training. Geniesse den Tag.'}
      </Text>
    </Card>
  );
}

export default RestDayCard;
