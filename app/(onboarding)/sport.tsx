/**
 * Sport Selection Screen — Athletly V2 Companion Onboarding
 *
 * Step 1 of 6 (design spec section 3.2).
 *
 * - 2-column grid of sport tiles (multi-select via SelectableTile)
 * - VoiceTextInput sends transcript to POST /api/onboarding/parse-voice (step: "sport")
 * - ParsedTags shows AI-extracted sports; tapping X removes them from the selection
 * - "Weiter" enabled when >= 1 sport is selected
 * - Navigates to /(onboarding)/goals on continue
 */

import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bike, Dumbbell, Footprints, Medal, Waves, Flower2 } from 'lucide-react-native';

import { CompanionCard } from '@/components/onboarding/CompanionCard';
import { ParsedTags } from '@/components/onboarding/ParsedTags';
import { SelectableTile } from '@/components/onboarding/SelectableTile';
import { VoiceTextInput } from '@/components/onboarding/VoiceTextInput';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';
import { parseVoice } from '@/lib/parseVoice';
import { useOnboardingStore } from '@/store/onboardingStore';

const TAG = 'SportScreen';

// Sport tile definitions ordered as per spec.
// Each entry maps the German display name to its lucide icon and accent color.
interface SportTile {
  label: string;
  key: string;
  icon: React.ReactNode;
  color: string;
}

const SPORT_TILES: SportTile[] = [
  {
    label: 'Laufen',
    key: 'Laufen',
    icon: <Footprints size={20} color={Colors.primary} strokeWidth={2} />,
    color: '#3B82F6',
  },
  {
    label: 'Radfahren',
    key: 'Radfahren',
    icon: <Bike size={20} color="#A855F7" strokeWidth={2} />,
    color: '#A855F7',
  },
  {
    label: 'Schwimmen',
    key: 'Schwimmen',
    icon: <Waves size={20} color="#06B6D4" strokeWidth={2} />,
    color: '#06B6D4',
  },
  {
    label: 'Gym',
    key: 'Gym',
    icon: <Dumbbell size={20} color="#F59E0B" strokeWidth={2} />,
    color: '#F59E0B',
  },
  {
    label: 'Yoga',
    key: 'Yoga',
    icon: <Flower2 size={20} color="#EC4899" strokeWidth={2} />,
    color: '#EC4899',
  },
  {
    label: 'Triathlon',
    key: 'Triathlon',
    icon: <Medal size={20} color="#22C55E" strokeWidth={2} />,
    color: '#22C55E',
  },
];

export default function SportScreen() {
  const router = useRouter();
  const { sports, toggleSport, setStep } = useOnboardingStore();

  // Voice input text field state (cleared after a successful parse)
  const [voiceText, setVoiceText] = useState('');
  // Tags returned by the AI parse-voice endpoint
  const [parsedTags, setParsedTags] = useState<string[]>([]);
  // Whether we're waiting for the AI to process the transcript
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    log.info(TAG, 'Screen mounted');
    setStep(0);
    return () => log.info(TAG, 'Screen unmounted');
  }, [setStep]);

  // Called by VoiceTextInput once the user finishes speaking (or submits text).
  const handleVoiceResult = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) {
        log.debug(TAG, 'Empty transcript — skipping parse');
        return;
      }

      log.info(TAG, 'Parsing voice transcript', { length: transcript.length });
      setIsParsing(true);

      try {
        const result = await parseVoice(transcript, 'sport');
        log.info(TAG, 'parse-voice succeeded', { items: result.items });

        // Add newly parsed items to both the tags display and the store.
        // Only add items that aren't already selected to avoid duplicates.
        const newItems = result.items.filter((item) => !sports.includes(item));
        if (newItems.length > 0) {
          newItems.forEach((item) => toggleSport(item));
          setParsedTags((prev) => [
            ...prev,
            ...newItems.filter((item) => !prev.includes(item)),
          ]);
        }

        setVoiceText('');
      } catch (err) {
        log.error(TAG, 'parse-voice request failed', { error: String(err) });
        // Keep the transcript in the text field so the user can retry manually
      } finally {
        setIsParsing(false);
      }
    },
    [sports, toggleSport],
  );

  // Remove a tag from both the parsed-tags list and the store selection.
  const handleRemoveTag = useCallback(
    (tag: string) => {
      log.debug(TAG, `Removing parsed tag: ${tag}`);
      setParsedTags((prev) => prev.filter((t) => t !== tag));
      if (sports.includes(tag)) {
        toggleSport(tag);
      }
    },
    [sports, toggleSport],
  );

  const handleContinue = useCallback(() => {
    log.info(TAG, 'Navigating to goals', { sports });
    router.push('/(onboarding)/goals');
  }, [router, sports]);

  const canContinue = sports.length >= 1;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CompanionCard question="Welchen Sport machst du?">
          {/* 2-column sport tile grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {SPORT_TILES.map((sport) => (
              <View key={sport.key} style={{ width: '48%' }}>
                <SelectableTile
                  label={sport.label}
                  icon={sport.icon}
                  color={sport.color}
                  selected={sports.includes(sport.key)}
                  onPress={() => {
                    log.debug(TAG, `Tile pressed: ${sport.key}`);
                    toggleSport(sport.key);
                  }}
                />
              </View>
            ))}
          </View>

          {/* Voice / text input */}
          <View className="mt-5">
            <VoiceTextInput
              value={voiceText}
              onChangeText={setVoiceText}
              onVoiceResult={handleVoiceResult}
              placeholder="Oder sag es mir…"
              isProcessing={isParsing}
            />
          </View>

          {/* AI-parsed tags — only shown when there are results */}
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
