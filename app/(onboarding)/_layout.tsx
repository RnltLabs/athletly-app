/**
 * Onboarding Layout — Athletly V2 Companion Onboarding
 *
 * Design spec sections 3.1–3.7, 10.
 * Stack navigator for the companion onboarding flow.
 *
 * - Welcome (index) has no header
 * - All other screens share a custom header:
 *     [Back button]   [ProgressDots centered]   [spacer]
 * - ProgressDots show 6 total steps, 0-indexed by screen
 */

import { useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { ProgressDots } from '@/components/onboarding/ProgressDots';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';

const TAG = 'OnboardingLayout';

/** Total number of companion steps (Welcome is not counted). */
const TOTAL_STEPS = 6;

/** Map each screen name to its 0-indexed step position. */
const STEP_MAP: Record<string, number> = {
  sport: 0,
  goals: 1,
  schedule: 2,
  health: 3,
  summary: 4,
  'create-account': 5,
};

function OnboardingHeader({ route }: NativeStackHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentStep = STEP_MAP[route.name] ?? 0;

  const handleBack = useCallback(() => {
    log.info(TAG, 'Back pressed', { from: route.name });
    router.back();
  }, [router, route.name]);

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.background,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Back button */}
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Zurück"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: Colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: Colors.divider,
        }}
      >
        <ChevronLeft size={20} color={Colors.textPrimary} strokeWidth={2} />
      </Pressable>

      {/* ProgressDots centered */}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <ProgressDots total={TOTAL_STEPS} current={currentStep} />
      </View>

      {/* Right spacer — mirrors back button width for visual balance */}
      <View style={{ width: 36 }} />
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      {/* Welcome — no header, no back gesture */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* Step 1 */}
      <Stack.Screen
        name="sport"
        options={{
          headerShown: true,
          header: (props) => <OnboardingHeader {...props} />,
        }}
      />

      {/* Step 2 */}
      <Stack.Screen
        name="goals"
        options={{
          headerShown: true,
          header: (props) => <OnboardingHeader {...props} />,
        }}
      />

      {/* Step 3 */}
      <Stack.Screen
        name="schedule"
        options={{
          headerShown: true,
          header: (props) => <OnboardingHeader {...props} />,
        }}
      />

      {/* Step 4 */}
      <Stack.Screen
        name="health"
        options={{
          headerShown: true,
          header: (props) => <OnboardingHeader {...props} />,
        }}
      />

      {/* Step 5 */}
      <Stack.Screen
        name="summary"
        options={{
          headerShown: true,
          header: (props) => <OnboardingHeader {...props} />,
        }}
      />

      {/* Step 6 */}
      <Stack.Screen
        name="create-account"
        options={{
          headerShown: true,
          header: (props) => <OnboardingHeader {...props} />,
        }}
      />
    </Stack>
  );
}
