import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/lib/colors';

interface SelectableTileProps {
  label: string;
  icon?: ReactNode;
  color?: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectableTile({ label, icon, color, selected, onPress }: SelectableTileProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const activeColor = color ?? Colors.primary;

  const containerStyle = {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: selected ? Colors.primaryLight : Colors.surfaceNested,
    borderColor: selected ? activeColor : Colors.divider,
    paddingHorizontal: 14,
  } as const;

  const labelStyle = {
    fontSize: 15,
    fontWeight: '500' as const,
    color: selected ? activeColor : Colors.textPrimary,
    flexShrink: 1,
  } as const;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [containerStyle, { opacity: pressed ? 0.75 : 1 }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      <View className="flex-1 flex-row items-center gap-3">
        {icon ? (
          <View style={{ flexShrink: 0 }}>
            {icon}
          </View>
        ) : null}
        <Text style={labelStyle} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default SelectableTile;
