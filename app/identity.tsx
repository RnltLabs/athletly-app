/**
 * Identity Screen - "Wie Athletly dich sieht"
 *
 * Standalone route (not a tab). Shows the athlete what the AI coach has
 * learned about them: a structured profile block and 7 canonical text
 * sections. Read-only; every section has an "Im Chat anpassen" CTA that
 * deep-links to the coach screen with a pre-filled draft message which
 * the user can edit before sending.
 */

import React, { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';
import { useAuthStore } from '@/store/authStore';
import { useIdentityStore } from '@/store/identityStore';
import { Skeleton } from '@/components/ui';
import {
  IdentityHeaderCard,
  StructuredProfileCard,
  SmartSectionCard,
  GoalHeroCard,
  TrainingMetricsCard,
} from '@/components/identity';
import type {
  IdentitySection,
  IdentityStructured,
} from '@/types/identity';

const TAG = 'IdentityScreen';

const STRUCTURED_DRAFT = 'Lass uns mein Profil anpassen: ';

function buildSectionDraft(section: IdentitySection): string {
  return `Lass uns ${section.title} anpassen: `;
}

export default function IdentityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const currentIdentity = useIdentityStore((s) => s.currentIdentity);
  const isLoading = useIdentityStore((s) => s.isLoading);
  const error = useIdentityStore((s) => s.error);
  const fetchIdentity = useIdentityStore((s) => s.fetchIdentity);

  useEffect(() => {
    log.info(TAG, 'Screen mounted');
    return () => log.info(TAG, 'Screen unmounted');
  }, []);

  useEffect(() => {
    if (userId) {
      log.info(TAG, 'Fetching identity', { userId: userId.slice(0, 8) });
      fetchIdentity(userId);
    }
  }, [userId, fetchIdentity]);

  const openChatWithDraft = useCallback(
    (draft: string) => {
      router.push({ pathname: '/(tabs)/coach', params: { draft } });
    },
    [router],
  );

  const handleStructuredEdit = useCallback(() => {
    openChatWithDraft(STRUCTURED_DRAFT);
  }, [openChatWithDraft]);

  const handleSectionEdit = useCallback(
    (section: IdentitySection) => {
      openChatWithDraft(buildSectionDraft(section));
    },
    [openChatWithDraft],
  );

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-3 pb-5">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 rounded-full p-1"
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Zurueck"
            >
              <ArrowLeft size={22} color="#FFFFFF" />
            </Pressable>
            <View className="flex-1">
              <Text
                className="text-white text-xl font-bold"
                style={{ letterSpacing: -0.3 }}
              >
                Wie Athletly dich sieht
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {isLoading && !currentIdentity ? (
          <LoadingState />
        ) : error && !currentIdentity ? (
          <ErrorState message={error} />
        ) : currentIdentity ? (
          <View className="gap-3">
            <IdentityHeaderCard
              athleteName={currentIdentity.athlete_name}
              lastUpdatedAt={currentIdentity.last_updated_at}
            />

            <StructuredProfileCard
              structured={currentIdentity.structured}
              onEditPress={handleStructuredEdit}
            />

            {currentIdentity.sections.map((section) => (
              <SectionCard
                key={section.key}
                section={section}
                structured={currentIdentity.structured}
                onEditPress={handleSectionEdit}
              />
            ))}

            <Text className="text-text-muted text-xs text-center mt-4 px-2 leading-5">
              Athletly lernt aus jeder Unterhaltung. Korrigiere im Chat, dann
              aktualisiert sich diese Ansicht.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

interface SectionCardProps {
  readonly section: IdentitySection;
  readonly structured: IdentityStructured;
  readonly onEditPress: (section: IdentitySection) => void;
}

function SectionCard({ section, structured, onEditPress }: SectionCardProps) {
  if (section.key === 'current_goal') {
    return (
      <GoalHeroCard
        section={section}
        structured={structured}
        onEditPress={onEditPress}
      />
    );
  }
  if (section.key === 'training') {
    return (
      <TrainingMetricsCard
        section={section}
        structured={structured}
        onEditPress={onEditPress}
      />
    );
  }
  return <SmartSectionCard section={section} onEditPress={onEditPress} />;
}

function LoadingState() {
  return (
    <View className="gap-3">
      <Skeleton width="100%" height={96} borderRadius={20} />
      <Skeleton width="100%" height={320} borderRadius={16} />
      <Skeleton width="100%" height={140} borderRadius={16} />
      <Skeleton width="100%" height={140} borderRadius={16} />
    </View>
  );
}

interface ErrorStateProps {
  readonly message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <Text className="text-text-primary text-base font-semibold mb-2 text-center">
        Konnte dein Profil nicht laden.
      </Text>
      <Text className="text-text-muted text-sm text-center">
        {message}
      </Text>
    </View>
  );
}
