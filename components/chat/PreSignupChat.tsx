/**
 * PreSignupChat - Athletly V2
 *
 * Full-screen pre-signup chat state. Shown when the user has no Supabase
 * session. Renders a single welcome message and a signup action card.
 * No SSE connection is established here - the real chat takes over the
 * moment a session is acquired (handled at the root layout).
 */

import React, { useState } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { ChatBubble } from './ChatBubble';
import { ActionCard } from './ActionCard';
import { SignupModal } from './SignupModal';
import type { ChatMessage } from '@/types/chat';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-pre-signup',
  role: 'assistant',
  content: 'Hi! Ich bin Athletly, dein AI-Coach. Lass uns starten - erstell dir kurz einen Account.',
  timestamp: new Date(),
  synced: false,
};

type Item =
  | { kind: 'message'; message: ChatMessage }
  | { kind: 'signup-action'; id: string };

const ITEMS: Item[] = [
  { kind: 'signup-action', id: 'signup-action' },
  { kind: 'message', message: WELCOME_MESSAGE },
];

export function PreSignupChat() {
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }: { item: Item }) => {
    if (item.kind === 'message') {
      return <ChatBubble message={item.message} />;
    }
    return (
      <ActionCard
        label="Account erstellen"
        description="Erstelle einen kostenlosen Account und wir legen los."
        onPress={() => setModalVisible(true)}
      />
    );
  };

  const keyExtractor = (item: Item) =>
    item.kind === 'message' ? item.message.id : item.id;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <View className="flex-1 bg-background">
        <GradientHeader
          title="Athletly"
          rightContent={
            <View className="flex-row items-center gap-1.5">
              <Text className="text-white text-xs font-medium">Willkommen</Text>
            </View>
          }
        />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={ITEMS}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            inverted
            contentContainerClassName="px-4 py-2"
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>
        <SignupModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

export default PreSignupChat;
