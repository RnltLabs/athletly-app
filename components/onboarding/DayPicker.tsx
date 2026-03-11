import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/lib/colors';
import type { DayOfWeek } from '@/store/onboardingStore';

interface DayPickerProps {
  selectedDays: DayOfWeek[];
  onToggle: (day: DayOfWeek) => void;
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Mo' },
  { key: 'tue', label: 'Di' },
  { key: 'wed', label: 'Mi' },
  { key: 'thu', label: 'Do' },
  { key: 'fri', label: 'Fr' },
  { key: 'sat', label: 'Sa' },
  { key: 'sun', label: 'So' },
];

const BUTTON_SIZE = 44;

export function DayPicker({ selectedDays, onToggle }: DayPickerProps) {
  const handlePress = (day: DayOfWeek) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(day);
  };

  return (
    <View className="flex-row justify-between">
      {DAYS.map(({ key, label }) => {
        const isSelected = selectedDays.includes(key);

        const buttonStyle = {
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: BUTTON_SIZE / 2,
          borderWidth: 1,
          backgroundColor: isSelected ? Colors.primary : Colors.surface,
          borderColor: isSelected ? Colors.primary : Colors.divider,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        };

        const labelStyle = {
          fontSize: 13,
          fontWeight: '600' as const,
          color: isSelected ? '#FFFFFF' : Colors.textSecondary,
        };

        return (
          <Pressable
            key={key}
            onPress={() => handlePress(key)}
            style={({ pressed }) => [buttonStyle, { opacity: pressed ? 0.75 : 1 }]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={label}
          >
            <Text style={labelStyle}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default DayPicker;
