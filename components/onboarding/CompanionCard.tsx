import React from 'react';
import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Colors } from '@/lib/colors';

interface CompanionCardProps {
  question: string;
  subtitle?: string;
  children: ReactNode;
}

// Hero card elevation — matches Card variant="hero" shadow style
const HERO_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
} as const;

// Typography constants derived from design system
const QUESTION_STYLE = {
  fontSize: 26,
  fontWeight: '700' as const,
  lineHeight: 32,
  letterSpacing: -0.3,
  color: Colors.textPrimary,
} as const;

const SUBTITLE_STYLE = {
  fontSize: 13,
  fontWeight: '400' as const,
  lineHeight: 18,
  color: Colors.textSecondary,
} as const;

export function CompanionCard({ question, subtitle, children }: CompanionCardProps) {
  return (
    <View
      className="bg-surface rounded-[20px] p-5"
      style={HERO_SHADOW}
    >
      {/* Question — h1, textPrimary, centered */}
      <Text
        style={QUESTION_STYLE}
        className="text-center"
        accessibilityRole="header"
      >
        {question}
      </Text>

      {/* Subtitle — bodySm, textSecondary, centered */}
      {subtitle ? (
        <Text
          style={SUBTITLE_STYLE}
          className="text-center mt-2"
        >
          {subtitle}
        </Text>
      ) : null}

      {/* Step-specific content with lg (24px) top spacing */}
      <View className="mt-6">
        {children}
      </View>
    </View>
  );
}

export default CompanionCard;
