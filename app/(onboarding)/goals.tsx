/**
 * Goals Screen — Athletly V2 Companion Onboarding
 *
 * Step 2 of 6 (design spec section 3.3).
 *
 * - 1-column list of goal tiles (multi-select via SelectableTile)
 * - Prominent VoiceTextInput for free-text specific goals (race, date, target time)
 * - Voice transcript sent to POST /api/onboarding/parse-voice (step: "goals")
 * - ParsedTags shows AI-extracted goal fragments; tapping X removes them
 * - Tiles AND free-text/parsed-tags are combined: "Weiter" enabled when
 *   >= 1 goal is selected (tile or parsed tag) OR customGoal is non-empty
 * - Navigates to /(onboarding)/schedule on continue
 */

import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Activity,
  Heart,
  Timer,
  TrendingDown,
  Trophy,
} from 'lucide-react-native';

import { CompanionCard } from '@/components/onboarding/CompanionCard';
import { ParsedTags } from '@/components/onboarding/ParsedTags';
import { SelectableTile } from '@/components/onboarding/SelectableTile';
import { VoiceTextInput } from '@/components/onboarding/VoiceTextInput';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';
import { parseVoice } from '@/lib/parseVoice';
import { useOnboardingStore } from '@/store/onboardingStore';

const TAG = 'GoalsScreen';

interface GoalTile {
  label: string;
  key: string;
  icon: React.ReactNode;
}

const GOAL_TILES: GoalTile[] = [
  {
    label: 'Fitness verbessern',
    key: 'Fitness verbessern',
    icon: <Activity size={20} color={Colors.primary} strokeWidth={2} />,
  },
  {
    label: 'Schneller werden',
    key: 'Schneller werden',
    icon: <Timer size={20} color={Colors.primary} strokeWidth={2} />,
  },
  {
    label: 'Abnehmen',
    key: 'Abnehmen',
    icon: <TrendingDown size={20} color={Colors.primary} strokeWidth={2} />,
  },
  {
    label: 'Wettkampf vorbereiten',
    key: 'Wettkampf vorbereiten',
    icon: <Trophy size={20} color={Colors.primary} strokeWidth={2} />,
  },
  {
    label: 'Gesundheit',
    key: 'Gesundheit',
    icon: <Heart size={20} color={Colors.primary} strokeWidth={2} />,
  },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, customGoal, toggleGoal, setCustomGoal, setStep } = useOnboardingStore();

  // Voice input text field value (cleared after successful parse)
  const [voiceText, setVoiceText] = useState(customGoal ?? '');
  // Tags returned by the AI parse-voice endpoint for this step
  const [parsedTags, setParsedTags] = useState<string[]>([]);
  // Whether we're waiting for the AI parse
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    log.info(TAG, 'Screen mounted');
    setStep(1);
    return () => log.info(TAG, 'Screen unmounted');
  }, [setStep]);

  // Sync the text field back to the store whenever it changes so the
  // free-text goal is included when "Weiter" is pressed.
  const handleTextChange = useCallback(
    (text: string) => {
      setVoiceText(text);
      setCustomGoal(text.trim().length > 0 ? text : null);
    },
    [setCustomGoal],
  );

  // Called by VoiceTextInput once recording ends or user submits text.
  const handleVoiceResult = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) {
        log.debug(TAG, 'Empty transcript — skipping parse');
        return;
      }

      log.info(TAG, 'Parsing voice transcript for goals', { length: transcript.length });
      setIsParsing(true);

      try {
        const result = await parseVoice(transcript, 'goals');
        log.info(TAG, 'parse-voice succeeded', {
          items: result.items,
          structured: result.structured,
        });

        // Add each new parsed item to the goals store if not already there.
        const newItems = result.items.filter((item) => !goals.includes(item));
        if (newItems.length > 0) {
          newItems.forEach((item) => toggleGoal(item));
          setParsedTags((prev) => [
            ...prev,
            ...newItems.filter((item) => !prev.includes(item)),
          ]);
        }

        // Also store the raw transcript as customGoal so the backend receives it.
        setCustomGoal(transcript.trim());
        setVoiceText(transcript);
      } catch (err) {
        log.error(TAG, 'parse-voice request failed', { error: String(err) });
        // Keep the transcript visible so the user can retry or edit manually.
      } finally {
        setIsParsing(false);
      }
    },
    [goals, toggleGoal, setCustomGoal],
  );

  // Remove a tag from both the parsed-tags display and the goals store.
  const handleRemoveTag = useCallback(
    (tag: string) => {
      log.debug(TAG, `Removing parsed tag: ${tag}`);
      setParsedTags((prev) => prev.filter((t) => t !== tag));
      if (goals.includes(tag)) {
        toggleGoal(tag);
      }
    },
    [goals, toggleGoal],
  );

  const handleContinue = useCallback(() => {
    log.info(TAG, 'Navigating to schedule', {
      goals,
      customGoal,
      parsedTagCount: parsedTags.length,
    });
    router.push('/(onboarding)/schedule');
  }, [router, goals, customGoal, parsedTags.length]);

  // Enabled when at least one tile is selected, a parsed tag exists,
  // or the free-text field has content.
  const canContinue =
    goals.length >= 1 ||
    parsedTags.length >= 1 ||
    (customGoal !== null && customGoal.trim().length > 0);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CompanionCard
          question="Was möchtest du erreichen?"
          subtitle="Wähle alles aus, was passt — du kannst mehrere Ziele kombinieren."
        >
          {/* 1-column goal tiles */}
          <View style={{ gap: 10 }}>
            {GOAL_TILES.map((goal) => (
              <SelectableTile
                key={goal.key}
                label={goal.label}
                icon={goal.icon}
                color={Colors.primary}
                selected={goals.includes(goal.key)}
                onPress={() => {
                  log.debug(TAG, `Goal tile pressed: ${goal.key}`);
                  toggleGoal(goal.key);
                }}
              />
            ))}
          </View>

          {/* Divider with "oder" label */}
          <View className="flex-row items-center my-5" style={{ gap: 10 }}>
            <View className="flex-1" style={{ height: 1, backgroundColor: Colors.divider }} />
            <Text
              className="text-xs font-medium"
              style={{ color: Colors.textMuted }}
            >
              oder
            </Text>
            <View className="flex-1" style={{ height: 1, backgroundColor: Colors.divider }} />
          </View>

          {/* Prominent voice/text input for specific goals */}
          <View>
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: Colors.textSecondary }}
            >
              Sprich oder schreib dein spezifisches Ziel
            </Text>
            <VoiceTextInput
              value={voiceText}
              onChangeText={handleTextChange}
              onVoiceResult={handleVoiceResult}
              placeholder="z.B. Karlsruher Halbmarathon im September unter 1:30h"
              isProcessing={isParsing}
            />
          </View>

          {/* AI-parsed goal tags */}
          {parsedTags.length > 0 && (
            <View className="mt-4">
              <Text
                className="text-xs font-medium mb-2"
                style={{ color: Colors.textSecondary }}
              >
                Erkannt:
              </Text>
              <ParsedTags
                tags={parsedTags}
                onRemove={handleRemoveTag}
                color={Colors.primary}
              />
            </View>
          )}
        </CompanionCard>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        className="px-4 pb-4 pt-2"
        style={{ borderTopWidth: 1, borderTopColor: Colors.divider }}
      >
        <Button
          variant="primary"
          size="lg"
          label="Weiter"
          disabled={!canContinue}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}
