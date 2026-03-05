import React from 'react';
import { Pressable, View } from 'react-native';
import type { ReactNode } from 'react';

type CardVariant = 'standard' | 'hero' | 'metric' | 'glass';

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  standard: 'bg-surface border border-border/50 rounded-2xl p-4',
  hero: 'bg-surface border border-border/50 rounded-2xl p-5',
  metric: 'bg-surface border border-border/50 rounded-2xl p-4 items-center',
  glass: 'rounded-2xl p-4 border border-border/30 overflow-hidden',
};

const GLASS_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.03)',
} as const;

export function Card({ variant = 'standard', children, onPress, className = '' }: CardProps) {
  const baseClass = `${variantClasses[variant]} ${className}`;
  const isGlass = variant === 'glass';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={baseClass}
        style={({ pressed }) => [
          isGlass ? GLASS_STYLE : undefined,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={baseClass} style={isGlass ? GLASS_STYLE : undefined}>
      {children}
    </View>
  );
}

export default Card;
