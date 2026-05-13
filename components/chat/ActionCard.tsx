/**
 * ActionCard - Athletly V2
 *
 * Inline call-to-action card for agent-proposed actions in the chat.
 * Strong primary CTA with brand color; optional description above the button.
 * Used for signup, garmin connect, and future action types.
 */

import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '@/lib/colors';

type ActionCardVariant = 'primary' | 'subtle';

interface ActionCardProps {
  label: string;
  description?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ActionCardVariant;
}

const CARD_STYLE = {
  backgroundColor: Colors.surface,
  borderRadius: 16,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 2,
} as const;

const PRIMARY_BUTTON_STYLE = {
  backgroundColor: Colors.primary,
  borderRadius: 12,
  height: 48,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 20,
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
};

const SUBTLE_BUTTON_STYLE = {
  backgroundColor: Colors.primaryUltraLight,
  borderRadius: 12,
  height: 48,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 20,
  borderWidth: 1,
  borderColor: Colors.primaryLight,
};

export function ActionCard({
  label,
  description,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: ActionCardProps) {
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <View className="self-stretch mb-3">
      <View style={CARD_STYLE}>
        {description && (
          <Text
            className="text-sm leading-5 mb-3"
            style={{ color: Colors.textSecondary }}
          >
            {description}
          </Text>
        )}
        <Pressable
          onPress={onPress}
          disabled={isDisabled}
          style={({ pressed }) => [
            isPrimary ? PRIMARY_BUTTON_STYLE : SUBTLE_BUTTON_STYLE,
            { opacity: pressed && !isDisabled ? 0.85 : isDisabled ? 0.5 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: isDisabled }}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isPrimary ? '#FFFFFF' : Colors.primary}
            />
          ) : (
            <Text
              className="font-semibold text-base"
              style={{ color: isPrimary ? '#FFFFFF' : Colors.primary }}
            >
              {label}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default ActionCard;
