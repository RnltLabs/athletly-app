/**
 * Profile Screen — Athletly V2 (Placeholder)
 *
 * User profile, settings, and connected services. Full implementation in a later wave.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import { EmptyState } from '@/components/ui';

export default function ProfileScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-text-primary text-2xl font-bold">
          Profil
        </Text>
      </View>
      <EmptyState
        icon={User}
        title="Profil"
        description="Profileinstellungen werden in einer spaeteren Version verfuegbar sein."
      />
    </SafeAreaView>
  );
}
