/**
 * ActionCard - Athletly V2
 *
 * Generic inline card for agent-proposed actions in the chat.
 * Mirrors the visual rhythm of CheckpointCard but stays action-agnostic
 * (signup, garmin connect, future action types).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type ActionCardVariant = 'primary' | 'subtle';

interface ActionCardProps {
  label: string;
  description?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ActionCardVariant;
}

export function ActionCard({
  label,
  description,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: ActionCardProps) {
  const buttonVariant = variant === 'subtle' ? 'ghost' : 'primary';

  return (
    <View className="self-start max-w-[90%] mb-3">
      <Card variant="nested" className="gap-3">
        {description && (
          <Text className="text-text-secondary text-sm leading-5">
            {description}
          </Text>
        )}
        <Button
          variant={buttonVariant}
          size="md"
          label={label}
          onPress={onPress}
          loading={loading}
          disabled={disabled || loading}
        />
      </Card>
    </View>
  );
}

export default ActionCard;
