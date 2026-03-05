/**
 * Onboarding Layout — Athletly V2
 *
 * Stack layout for the chat-based onboarding flow.
 * No headers, no back navigation, light background.
 */

import { Stack } from 'expo-router';
import { Colors } from '@/lib/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
