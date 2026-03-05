/**
 * Auth Layout — Athletly V2
 *
 * Stack layout for login and register screens.
 * No headers, dark background.
 */

import { Stack } from 'expo-router';
import { Colors } from '@/lib/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
