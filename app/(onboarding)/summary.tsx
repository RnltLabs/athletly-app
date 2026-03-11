/**
 * Summary Screen — Athletly V2 Companion Onboarding
 *
 * Design spec section 3.6 — Step 5 of 6.
 * Pure display screen: reads all collected data from onboardingStore
 * and presents it as a confirmation before account creation.
 *
 * Layout:
 *   - CompanionCard with question "So starten wir zusammen"
 *   - Sections: Sport, Ziel, Trainingstage, Verbunden
 *   - Each section: bold label + flex-wrap row of pills
 *   - Sections omitted if empty
 *   - "Weiter" navigates to create-account
 */

import { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { CompanionCard } from '@/components/onboarding/CompanionCard';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { DayOfWeek } from '@/store/onboardingStore';
import { Colors } from '@/lib/colors';
import { getSportColor } from '@/lib/sport-colors';
import { log } from '@/lib/logger';

const TAG = 'SummaryScreen';

// ---------------------------------------------------------------------------
// Day label mapping
// ---------------------------------------------------------------------------

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'Mo',
  tue: 'Di',
  wed: 'Mi',
  thu: 'Do',
  fri: 'Fr',
  sat: 'Sa',
  sun: 'So',
};

// Ordered so pills render in calendar week order
const DAY_ORDER: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// ---------------------------------------------------------------------------
// Wearable display labels
// ---------------------------------------------------------------------------

const WEARABLE_LABELS: Record<string, string> = {
  garmin: 'Garmin Connect',
  apple_health: 'Apple Health',
  health_connect: 'Health Connect',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

function Section({ label, children }: SectionProps) {
  return (
    <View className="mb-5">
      <Text
        className="text-sm font-bold mb-2"
        style={{ color: Colors.textSecondary }}
      >
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {children}
      </View>
    </View>
  );
}

interface PillProps {
  label: string;
  color?: string;
}

function Pill({ label, color }: PillProps) {
  const bgColor = color ? `${color}20` : Colors.primaryLight; // 20 = ~12% opacity hex
  const textColor = color ?? Colors.primary;

  return (
    <View
      className="rounded-full px-3 py-1.5"
      style={{ backgroundColor: bgColor }}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
}

interface WearablePillProps {
  label: string;
}

function WearablePill({ label }: WearablePillProps) {
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ backgroundColor: Colors.successLight }}
    >
      <CheckCircle size={14} color={Colors.success} strokeWidth={2.5} />
      <Text
        className="text-sm font-medium"
        style={{ color: Colors.success }}
      >
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SummaryScreen() {
  const router = useRouter();

  const sports = useOnboardingStore((s) => s.sports);
  const customSport = useOnboardingStore((s) => s.customSport);
  const goals = useOnboardingStore((s) => s.goals);
  const customGoal = useOnboardingStore((s) => s.customGoal);
  const availableDays = useOnboardingStore((s) => s.availableDays);
  const wearable = useOnboardingStore((s) => s.wearable);

  useEffect(() => {
    log.info(TAG, 'Screen mounted', {
      sports,
      customSport,
      goals,
      customGoal,
      availableDays,
      wearable,
    });
    return () => log.info(TAG, 'Screen unmounted');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWeiter = useCallback(() => {
    log.info(TAG, 'Navigating to create-account');
    router.push('/(onboarding)/create-account');
  }, [router]);

  // Build ordered selected days for display
  const orderedDays = DAY_ORDER.filter((d) => availableDays.includes(d));

  // Combine tile goals + custom goal for display
  const allGoals: string[] = [
    ...goals,
    ...(customGoal && customGoal.trim() ? [customGoal.trim()] : []),
  ];

  // Combine tile sports + custom sport for display
  const allSports: string[] = [
    ...sports,
    ...(customSport && customSport.trim() ? [customSport.trim()] : []),
  ];

  const hasSports = allSports.length > 0;
  const hasGoals = allGoals.length > 0;
  const hasDays = orderedDays.length > 0;
  const hasWearable = wearable !== null;

  log.debug(TAG, 'Render', { hasSports, hasGoals, hasDays, hasWearable });

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CompanionCard question="So starten wir zusammen">

            {/* Sport */}
            {hasSports && (
              <Section label="Sport">
                {allSports.map((sport) => (
                  <Pill
                    key={sport}
                    label={sport}
                    color={getSportColor(sport)}
                  />
                ))}
              </Section>
            )}

            {/* Ziel */}
            {hasGoals && (
              <Section label="Ziel">
                {allGoals.map((goal) => (
                  <Pill key={goal} label={goal} />
                ))}
              </Section>
            )}

            {/* Trainingstage */}
            {hasDays && (
              <Section label="Trainingstage">
                {orderedDays.map((day) => (
                  <Pill key={day} label={DAY_LABELS[day]} />
                ))}
              </Section>
            )}

            {/* Verbunden */}
            {hasWearable && (
              <Section label="Verbunden">
                <WearablePill label={WEARABLE_LABELS[wearable!] ?? wearable!} />
              </Section>
            )}

          </CompanionCard>

          {/* Spacer so button doesn't crowd card */}
          <View className="h-6" />

          <Button
            variant="primary"
            size="lg"
            label="Weiter"
            onPress={handleWeiter}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
