/**
 * Schedule Screen — Athletly V2 Companion Onboarding
 *
 * Design spec section 3.4 — Available Training Days (Step 3 of 6).
 *
 * - Title: "An welchen Tagen kannst du trainieren?"
 * - DayPicker component (7 day buttons Mo–So)
 * - Subtitle below picker explains coach-driven scheduling
 * - "Weiter" enabled when >= 1 day selected
 * - No voice input on this screen
 * - Navigates to /(onboarding)/health on confirm
 */

import { useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CompanionCard } from '@/components/onboarding/CompanionCard';
import { DayPicker } from '@/components/onboarding/DayPicker';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { log } from '@/lib/logger';

const TAG = 'ScheduleScreen';

export default function ScheduleScreen() {
  const router = useRouter();
  const availableDays = useOnboardingStore((s) => s.availableDays);
  const toggleDay = useOnboardingStore((s) => s.toggleDay);
  const setStep = useOnboardingStore((s) => s.setStep);

  const canContinue = availableDays.length >= 1;

  useEffect(() => {
    log.info(TAG, 'Screen mounted');
    setStep(2);
    return () => log.info(TAG, 'Screen unmounted');
  }, [setStep]);

  const handleToggleDay = useCallback(
    (day: Parameters<typeof toggleDay>[0]) => {
      log.debug(TAG, 'Day toggled', { day });
      toggleDay(day);
    },
    [toggleDay],
  );

  const handleContinue = useCallback(() => {
    log.info(TAG, 'Navigating to health', { selectedDays: availableDays });
    router.push('/(onboarding)/health');
  }, [router, availableDays]);

  return (
    <SafeAreaView
      className="flex-1"
      edges={['bottom']}
      style={{ backgroundColor: Colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Main card */}
        <CompanionCard question="An welchen Tagen kannst du trainieren?">
          <DayPicker selectedDays={availableDays} onToggle={handleToggleDay} />

          {/* Subtitle — displayed inside the card below the picker */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: '400',
              lineHeight: 18,
              color: Colors.textSecondary,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Wähle alle Tage an denen du Zeit hast. Dein Coach plant das optimale Training für dich.
          </Text>
        </CompanionCard>

        {/* Spacer pushes CTA toward bottom on larger screens */}
        <View style={{ flex: 1, minHeight: 32 }} />

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          label="Weiter"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
